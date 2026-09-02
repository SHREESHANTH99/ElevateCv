import os

filepath = 'Pages/DashBoard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix 1: Stats cards
text = text.replace('class-card rounded-xl p-6', 'class-card rounded-lg p-6') # wait, it's glass-card
text = text.replace('glass-card rounded-xl p-6', 'glass-card rounded-lg p-6')

# Fix 2: Quick Action Link cards
text = text.replace('group glass-card rounded-xl p-6 block hover:border-emerald-500/30 transition-all duration-300', 'group glass-card rounded-lg p-6 block hover:border-emerald-500/30 transition-all duration-300')

# Fix 3: Recent Activity container
text = text.replace('className="glass-card rounded-xl mb-8"', 'className="glass-card rounded-lg mb-8"')

# Fix 4: Recent Resume list items (rounded + zinc)
old_recent_item = 'className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800/60 hover:border-zinc-700/60 group"'
new_recent_item = 'className="flex items-center justify-between p-4 rounded-lg bg-[#0d1110]/30 hover:bg-[#0d1110]/50 transition-all duration-200 border border-zinc-800/60 hover:border-zinc-700/60 group"'
text = text.replace(old_recent_item, new_recent_item)

# Fix 5: Recommended Templates container (actually caught by Fix 3 if it's the exact same string, let's check)
# It is the exact same string: className="glass-card rounded-xl mb-8"

# Fix 6: Recommended Template card
text = text.replace('className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/60"', 'className="p-4 rounded-lg bg-[#0d1110]/30 border border-zinc-800/60"')


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print("DashBoard structural cards flattened and recolored.")
