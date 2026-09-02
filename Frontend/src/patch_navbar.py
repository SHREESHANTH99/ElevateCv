import os, re

def patch(filepath, func):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    new_text = func(text)
    if text != new_text:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_text)

def fix_navbar(t):
    old_nav = '''    <motion.nav
      className="glass sticky top-0 z-50 border-b border-zinc-800/60"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >'''
    
    old_nav_fallback = '''    <motion.nav
      className="glass sticky top-0 z-50 border-b border-zinc-800/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >'''
    
    new_nav = '''    <nav className="glass sticky top-0 z-50 border-b border-zinc-800/60">'''
    
    t = t.replace(old_nav, new_nav)
    t = t.replace(old_nav_fallback, new_nav)
    
    # Don't forget to close it
    t = t.replace('    </motion.nav>', '    </nav>')
    return t

patch('Components/Navbar.tsx', fix_navbar)
print("Fixed Navbar")
