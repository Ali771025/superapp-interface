/** SPECIAL 3.0 generated preset. Source of truth: source.json. */
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas:'var(--s3-canvas)', surface:'var(--s3-surface)', raised:'var(--s3-surface-raised)', interactive:'var(--s3-surface-interactive)',
        content:{DEFAULT:'var(--s3-text-primary)',secondary:'var(--s3-text-secondary)',muted:'var(--s3-text-muted)'},
        border:{DEFAULT:'var(--s3-border)',strong:'var(--s3-border-strong)'},
        primary:{DEFAULT:'var(--s3-primary)',hover:'var(--s3-primary-hover)',pressed:'var(--s3-primary-pressed)'},
        network:{blue:'var(--s3-network-blue)',cyan:'var(--s3-network-cyan)',teal:'var(--s3-network-teal)'},
        success:'var(--s3-success)',warning:'var(--s3-warning)',danger:'var(--s3-danger)',info:'var(--s3-info)',focus:'var(--s3-focus)',
      },
      borderRadius:{xs:'var(--s3-radius-xs)',sm:'var(--s3-radius-sm)',control:'var(--s3-radius-control)',nested:'var(--s3-radius-nested)',card:'var(--s3-radius-card)',panel:'var(--s3-radius-panel)'},
      spacing:{1:'var(--s3-space-1)',2:'var(--s3-space-2)',3:'var(--s3-space-3)',4:'var(--s3-space-4)',5:'var(--s3-space-5)',6:'var(--s3-space-6)',8:'var(--s3-space-8)',10:'var(--s3-space-10)',12:'var(--s3-space-12)',16:'var(--s3-space-16)'},
      minHeight:{control:'var(--s3-control-md)'},
      boxShadow:{1:'var(--s3-shadow-1)',2:'var(--s3-shadow-2)',3:'var(--s3-shadow-3)',4:'var(--s3-shadow-4)',glass:'var(--s3-glass-shadow)'},
      backdropBlur:{glassSubtle:'var(--s3-glass-blur-subtle)',glassFeatured:'var(--s3-glass-blur-featured)',glassOverlay:'var(--s3-glass-blur-overlay)'},
      transitionDuration:{instant:'80ms',fast:'140ms',standard:'200ms',panel:'280ms',slow:'420ms',ambient:'var(--s3-ambient-duration)'},
      transitionTimingFunction:{special:'var(--s3-ease-standard)',enter:'var(--s3-ease-enter)',exit:'var(--s3-ease-exit)'},
      maxWidth:{reading:'var(--s3-container-reading)',operation:'var(--s3-container-standard)',wide:'var(--s3-container-wide)',max:'var(--s3-container-max)'},
      zIndex:{raised:'10',sticky:'20',dock:'30',dropdown:'40',popover:'50',overlay:'80',modal:'100',toast:'110',skip:'120'},
      screens:{xs:'360px',sm:'480px',md:'768px',lg:'1024px',xl:'1280px','2xl':'1440px'},
    },
  },
};
