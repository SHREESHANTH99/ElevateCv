import os, re

filepath = 'Pages/ResumeBuilder.new.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

old_nav = 'p-3 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-300 border ${'
new_nav = 'p-3 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-300 border ${'
text = text.replace(old_nav, new_nav)

old_nav_bg = 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
new_nav_bg = 'bg-[#0d1110]/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
text = text.replace(old_nav_bg, new_nav_bg)

text = text.replace('glass-card rounded-xl p-6 lg:p-8 border-emerald-500/10 transition-all hover:border-emerald-500/30', 'glass-card rounded-lg p-6 lg:p-8 border-emerald-500/10 transition-all hover:border-emerald-500/30')

text = text.replace('glass-card p-8 rounded-xl text-center relative overflow-hidden group border-emerald-500/20', 'glass-card p-8 rounded-lg text-center relative overflow-hidden group border-emerald-500/20')

text = text.replace('glass-card p-6 rounded-xl space-y-4', 'glass-card p-6 rounded-lg space-y-4')

text = text.replace('glass-card rounded-xl p-6 border-cyan-500/10', 'glass-card rounded-lg p-6 border-cyan-500/10')

text = text.replace('p-5 bg-zinc-900/40 rounded-xl border border-zinc-800/50 hover:border-blue-500/20 transition-all group', 'p-5 bg-[#0d1110]/40 rounded-lg border border-zinc-800/50 hover:border-blue-500/20 transition-all group')

text = text.replace('className="flex-1 overflow-auto bg-zinc-900/30 p-4 lg:p-8"', 'className="flex-1 overflow-auto bg-[#0d1110]/30 p-4 lg:p-8"')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print("ResumeBuilder.new.tsx structural cards flattened and recolored.")
