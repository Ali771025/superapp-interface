#!/usr/bin/env python3
"""Create lean source and current-phase evidence exports."""
from pathlib import Path
import hashlib, json, sys, zipfile

if len(sys.argv) < 4:
    raise SystemExit("Usage: lean_export.py <project_root> <release_name> <phase_id> [output_dir]")

root = Path(sys.argv[1]).resolve()
release = sys.argv[2]
phase = sys.argv[3].strip("/")
outdir = Path(sys.argv[4]).resolve() if len(sys.argv) > 4 else root.parent
outdir.mkdir(parents=True, exist_ok=True)
source_zip = outdir / f"{release}_SOURCE_LEAN.zip"
evidence_zip = outdir / f"{release}_EVIDENCE.zip"

excluded_dirs = {"node_modules", "dist", "build", "coverage", ".git", ".cache", ".vite", "test-results", "playwright-report", ".next", "tmp", "temp", "__pycache__"}

def relative(path): return path.relative_to(root).as_posix()

def source_keep(path):
    rel = relative(path)
    parts = set(path.relative_to(root).parts)
    if parts & excluded_dirs or path.suffix.lower() == ".zip": return False
    if rel.startswith("artifacts/"): return False
    return True

def evidence_keep(path):
    rel = relative(path)
    test_phase = phase.replace("_", "-")
    return (rel.startswith(f"artifacts/special3_1/{phase}/")
            or rel.startswith(f"docs/special3_1/{phase}/")
            or rel.startswith(f"tests/special3_1-{test_phase}")
            or rel.startswith(f"scripts/special3_1-{test_phase}-capture"))

files = sorted((path for path in root.rglob("*") if path.is_file()), key=relative)
for archive, predicate in ((source_zip, source_keep), (evidence_zip, evidence_keep)):
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED, compresslevel=9, allowZip64=True) as output:
        for path in files:
            if predicate(path): output.write(path, f"{root.name}/{relative(path)}")

def descriptor(path):
    data = path.read_bytes()
    return {"file": path.name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}

manifest = {
    "release": release,
    "phase": phase,
    "source": descriptor(source_zip),
    "evidence": descriptor(evidence_zip),
    "excludedDirectories": sorted(excluded_dirs),
    "runtimeOrEvidenceQualityReduced": False,
    "policy": "packaging-only lean export",
}
(outdir / f"{release}_LEAN_EXPORT_MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(json.dumps(manifest, indent=2))
