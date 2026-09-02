import os, re

def patch(filepath, func):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    new_text = func(text)
    if text != new_text:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_text)

def fix_preview_modal(t):
    # Fix 2: The gradient icon background
    t = t.replace('bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl', 'bg-emerald-600 rounded-lg')
    return t
patch('Components/PreviewModal.tsx', fix_preview_modal)

def fix_landing(t):
    # Fix 3: LandingPage.tsx glow orb
    return t.replace('className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[120px]"', 'className="hidden"')
patch('Pages/LandingPage.tsx', fix_landing)

def fix_login(t):
    # Fix 4: LoginPage.tsx glow orb
    return t.replace('className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/8 rounded-full filter blur-[100px]"', 'className="hidden"')
patch('Pages/LoginPage.tsx', fix_login)

def fix_job(t):
    # Fix 5: JobMatcher.tsx dynamic score progress bar
    # Replace dynamic bg-gradient-to-r  with solid fill color thresholds
    old = r'className={h-full bg-gradient-to-r \$\{getScoreBarColor\(Number\(score\)\)\} rounded-full}'
    new = r'''className={h-full rounded-full }'''
    return re.sub(old, new, t)
patch('Pages/JobMatcher.tsx', fix_job)

def fix_templates(t):
    # Fix 6b: Templates.tsx initial={{ opacity: 0, scale: 0.95, y: 20 }}
    return t.replace('initial={{ opacity: 0, scale: 0.95, y: 20 }}', 'initial={{ opacity: 0 }}')
patch('Pages/Templates.tsx', fix_templates)

def fix_navbar(t):
    # Fix 6c: Navbar.tsx initial={{ y: -100 }}
    # We should just replace initial={{ y: -100 }} animate={{ y: 0 }} with empty or just initial={{ opacity: 1 }}
    t = t.replace('initial={{ y: -100 }}', 'initial={{ opacity: 1 }}')
    t = t.replace('animate={{ y: 0 }}', 'animate={{ opacity: 1 }}')
    return t
patch('Components/Navbar.tsx', fix_navbar)

def fix_profile(t):
    # Fix 6d: ProfilePage.tsx whileInView={{ opacity: 1, y: 0 }}
    return t.replace('whileInView={{ opacity: 1, y: 0 }}', 'whileInView={{ opacity: 1 }}')
patch('Pages/ProfilePage.tsx', fix_profile)

print("Applied HIGH severity patches.")
