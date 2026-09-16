// Mobile Nav Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('show'));
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('show'));
  });

  // Fetch real-time GitHub activity
  async function loadGitHubActivity(username) {
    const grid = document.getElementById('gh-grid');
    const monthsContainer = document.getElementById('gh-months');
    const totalEl = document.getElementById('gh-total-count');
    const tooltip = document.getElementById('gh-tooltip');

    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
      if (!res.ok) throw new Error("Could not fetch GitHub data");
      
      const data = await res.json();
      grid.innerHTML = '';
      monthsContainer.innerHTML = '';

      // Calculate total contributions
      const totalCount = data.total?.lastYear || data.contributions.reduce((acc, c) => acc + c.count, 0);
      totalEl.textContent = `${totalCount} contributions in the last year`;

      // Divide contribution days into 7-day columns
      const contributions = data.contributions;
      const weeks = [];
      for (let i = 0; i < contributions.length; i += 7) {
        weeks.push(contributions.slice(i, i + 7));
      }

      // Render month labels
      let currentMonth = '';
      weeks.forEach((week) => {
        const firstDay = new Date(week[0].date.replace(/-/g, '/'));
        const monthName = firstDay.toLocaleString('en-US', { month: 'short' });
        if (monthName !== currentMonth) {
          currentMonth = monthName;
          const span = document.createElement('span');
          span.textContent = monthName;
          monthsContainer.appendChild(span);
        }
      });

      // Date formatter for hover tooltip
      function formatDate(dateStr) {
        const d = new Date(dateStr.replace(/-/g, '/'));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      // Render heat map tiles
      weeks.forEach(week => {
        const weekCol = document.createElement('div');
        weekCol.className = 'gh-week';

        week.forEach(day => {
          const square = document.createElement('div');
          square.className = 'gh-day';
          square.setAttribute('data-level', day.level);
          
          const countText = day.count === 0 ? 'No contributions' : day.count === 1 ? '1 contribution' : `${day.count} contributions`;
          const formattedDate = formatDate(day.date);
          square.setAttribute('data-tooltip', `${countText} on ${formattedDate}`);

          weekCol.appendChild(square);
        });

        grid.appendChild(weekCol);
      });

      // Interactive Tooltip Hover Handler
      const ghSection = document.getElementById('github');
      grid.addEventListener('mouseover', (e) => {
        const dayEl = e.target.closest('.gh-day');
        if (!dayEl) return;

        const text = dayEl.getAttribute('data-tooltip');
        if (!text) return;

        tooltip.textContent = text;
        
        const dayRect = dayEl.getBoundingClientRect();
        const sectionRect = ghSection.getBoundingClientRect();

        const top = dayRect.top - sectionRect.top;
        const left = dayRect.left - sectionRect.left + (dayRect.width / 2);

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.classList.add('show');
      });

      grid.addEventListener('mouseout', (e) => {
        const dayEl = e.target.closest('.gh-day');
        if (dayEl) {
          tooltip.classList.remove('show');
        }
      });

    } catch (err) {
      grid.innerHTML = `<div class="gh-loading">Failed to load live data. <a href="https://github.com/${username}" target="_blank" style="color:#60a5fa;">View on GitHub</a></div>`;
      totalEl.textContent = "Live data unavailable";
    }
  }

  // Load activity using your GitHub username
  loadGitHubActivity('2022200000149-rantu');
