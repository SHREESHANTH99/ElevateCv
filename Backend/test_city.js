function parseHeaderLine(text) {
  const match = text.match(/,\s*([A-Z]{2})\b/);
  let location = '';
  if (match) {
    const beforeState = text.slice(0, match.index).trim();
    const words = beforeState.split(/\s+/);
    const cityWords = [];
    const JOB_TITLES = ['engineer', 'developer', 'manager', 'architect', 'lead', 'director', 'senior', 'software'];
    for (let i = words.length - 1; i >= 0 && cityWords.length < 2; i--) {
      const w = words[i].replace(/[^a-zA-Z]/g, '');
      if (JOB_TITLES.includes(w.toLowerCase())) break;
      cityWords.unshift(w);
    }
    if (cityWords.length > 0) {
      location = `${cityWords.join(' ')}, ${match[1]}`;
    }
  }

  const dateMatch = text.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})[A-Za-z0-9\s,\-\–\—]+(?:Present|[0-9]{4}))/i);
  const datesStr = dateMatch ? dateMatch[0].trim() : '';

  const mainPart = text.split(/\s+[\|–—]\s+/)[0] || text;
  const compTitleParts = mainPart.split(/\s+-\s+/);
  const company = compTitleParts[0] || '';
  let title = compTitleParts[1] || '';

  if (location && title.includes(location)) {
    title = title.replace(location, '').trim();
  }
  if (datesStr && title.includes(datesStr)) {
    title = title.replace(datesStr, '').trim();
  }

  return { company: company.trim(), title: title.trim(), location, dates: datesStr };
}

console.log(parseHeaderLine("Google DeepMind - Senior Software Engineer Mountain View, CA | Jan 2021 - Present"));
console.log(parseHeaderLine("Microsoft - Software Engineer Redmond, WA | Jun 2017 - Dec 2020"));
