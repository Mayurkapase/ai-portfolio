import { useState, useRef, useEffect } from 'react';
import {
  Github, Linkedin, Mail, ExternalLink, Star, Send,
  Sparkles, Code2, Briefcase, GraduationCap, User,
  ChevronDown, RotateCcw, Terminal, Zap, Coffee, Mountain
} from 'lucide-react';
import { useChat } from './hooks/useChat';
import type { Message } from './types';
import './App.css';

// ─── Data ────────────────────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    company: 'TechFlow Inc',
    role: 'Senior Software Engineer',
    period: '2022 — Present',
    highlights: [
      'Led development of real-time analytics dashboard for 50K+ daily users',
      'Reduced API response time by 40% through caching & query optimization',
      'Mentored team of 3 junior engineers',
    ],
    stack: ['React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Redis'],
  },
  {
    company: 'StartupXYZ',
    role: 'Software Engineer',
    period: '2020 — 2022',
    highlights: [
      'Built core product features 0→1 for B2B SaaS platform',
      'Integrated 10+ third-party APIs including Stripe, Twilio, SendGrid',
      'CI/CD pipelines reducing deployment time by 60%',
    ],
    stack: ['Vue.js', 'Node.js', 'MongoDB', 'Docker'],
  },
  {
    company: 'WebAgency Co',
    role: 'Junior Developer',
    period: '2019 — 2020',
    highlights: ['Developed 15+ client websites & e-commerce solutions'],
    stack: ['React', 'PHP', 'MySQL'],
  },
];

const PROJECTS = [
  {
    title: 'NeuralChat',
    description: 'AI-powered customer support platform with RAG and multi-language support',
    tech: ['React', 'FastAPI', 'OpenAI', 'PostgreSQL'],
    stars: 500,
    highlight: '20+ companies',
  },
  {
    title: 'DataFlow',
    description: 'Open source real-time data pipeline visualizer with D3.js animations',
    tech: ['React', 'D3.js', 'Python'],
    stars: 200,
    highlight: 'Open Source',
  },
  {
    title: 'PocketBudget',
    description: 'Personal finance tracking PWA with smart categorization',
    tech: ['React Native', 'Firebase'],
    stars: 80,
    highlight: '1K+ downloads',
  },
];

const SKILLS = [
  { label: 'Frontend', items: ['React', 'TypeScript', 'Vue.js', 'Next.js', 'Tailwind'] },
  { label: 'Backend', items: ['Python', 'FastAPI', 'Node.js', 'REST', 'GraphQL'] },
  { label: 'Data', items: ['PostgreSQL', 'MongoDB', 'Redis', 'SQLite'] },
  { label: 'AI / ML', items: ['OpenAI', 'LangChain', 'Hugging Face', 'RAG'] },
  { label: 'DevOps', items: ['Docker', 'GitHub Actions', 'AWS', 'Cloudflare'] },
];

// ─── Chat Components ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="chat-bubble chat-bubble--ai">
      <div className="typing-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isAI = message.role === 'assistant';
  return (
    <div className={`chat-message ${isAI ? 'chat-message--ai' : 'chat-message--user'}`}>
      {isAI && (
        <div className="chat-avatar">
          <Sparkles size={12} />
        </div>
      )}
      <div className={`chat-bubble ${isAI ? 'chat-bubble--ai' : 'chat-bubble--user'}`}>
        {message.content}
      </div>
    </div>
  );
}

function ChatPanel() {
  const { messages, loading, sendMessage, clearChat, suggestedQuestions } = useChat();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput('');
    setShowSuggestions(false);
    await sendMessage(msg);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-status-dot" />
          <span className="chat-header-title">Ask about Alex</span>
          <span className="chat-header-badge">AI</span>
        </div>
        <button className="chat-reset-btn" onClick={clearChat} title="New conversation">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map(m => <ChatMessage key={m.id} message={m} />)}
        {loading && <TypingIndicator />}
        {showSuggestions && messages.length <= 1 && (
          <div className="chat-suggestions">
            {suggestedQuestions.map(q => (
              <button
                key={q}
                className="chat-suggestion"
                onClick={() => handleSend(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <input
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything about Alex..."
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-eyebrow">
        <span className="hero-dot" />
        Available for opportunities
      </div>
      <h1 className="hero-name">
        Alex <em>Morgan</em>
      </h1>
      <p className="hero-role">Full-Stack Developer</p>
      <p className="hero-bio">
        I build scalable web applications and AI-powered products.
        4+ years crafting clean code and thoughtful user experiences.
      </p>
      <div className="hero-links">
        <a href="mailto:alex.morgan@email.com" className="btn btn--primary">
          <Mail size={15} /> Get in touch
        </a>
        <a href="https://github.com/alexmorgan" target="_blank" className="btn btn--ghost">
          <Github size={15} /> GitHub
        </a>
        <a href="https://linkedin.com/in/alexmorgan" target="_blank" className="btn btn--ghost">
          <Linkedin size={15} /> LinkedIn
        </a>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-num">4+</span>
          <span className="stat-label">Years exp.</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-num">50K+</span>
          <span className="stat-label">Users served</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-num">780+</span>
          <span className="stat-label">GitHub stars</span>
        </div>
      </div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section className="section" id="experience">
      <div className="section-label">
        <Briefcase size={14} />
        Experience
      </div>
      <div className="experience-list">
        {EXPERIENCE.map((exp, i) => (
          <div key={i} className="exp-card">
            <div className="exp-header">
              <div>
                <div className="exp-company">{exp.company}</div>
                <div className="exp-role">{exp.role}</div>
              </div>
              <div className="exp-period">{exp.period}</div>
            </div>
            <ul className="exp-highlights">
              {exp.highlights.map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
            <div className="tag-row">
              {exp.stack.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section className="section" id="projects">
      <div className="section-label">
        <Code2 size={14} />
        Projects
      </div>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <div key={i} className="project-card">
            <div className="project-header">
              <h3 className="project-title">{p.title}</h3>
              <div className="project-meta">
                {p.stars && (
                  <span className="project-stars">
                    <Star size={12} /> {p.stars}+
                  </span>
                )}
                <span className="project-highlight">{p.highlight}</span>
              </div>
            </div>
            <p className="project-desc">{p.description}</p>
            <div className="tag-row">
              {p.tech.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillsSection() {
  return (
    <section className="section" id="skills">
      <div className="section-label">
        <Zap size={14} />
        Skills
      </div>
      <div className="skills-grid">
        {SKILLS.map((s, i) => (
          <div key={i} className="skill-group">
            <div className="skill-label">{s.label}</div>
            <div className="tag-row">
              {s.items.map(item => <span key={item} className="tag">{item}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EducationSection() {
  return (
    <section className="section" id="education">
      <div className="section-label">
        <GraduationCap size={14} />
        Education & Achievements
      </div>
      <div className="edu-card">
        <div className="edu-degree">B.S. Computer Science</div>
        <div className="edu-school">UC Berkeley · 2019</div>
        <div className="edu-courses">
          Algorithms · Distributed Systems · Machine Learning · HCI
        </div>
      </div>
      <div className="achievements">
        <div className="achievement">
          <Terminal size={14} className="achievement-icon" />
          <span>Speaker at PyCon 2023 — "Building Production AI Applications"</span>
        </div>
        <div className="achievement">
          <Star size={14} className="achievement-icon" />
          <span>1st place — SF AI Hackathon 2022 (120 teams)</span>
        </div>
        <div className="achievement">
          <Github size={14} className="achievement-icon" />
          <span>50+ PRs merged to popular open source projects</span>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="section" id="about">
      <div className="section-label">
        <User size={14} />
        About
      </div>
      <p className="about-text">
        I'm a full-stack developer based in San Francisco with a passion for building
        products that feel effortless to use. I believe great software lives at the
        intersection of clean architecture and thoughtful design.
      </p>
      <p className="about-text">
        When I'm not coding, you'll find me rock climbing, obsessing over coffee
        brewing ratios, or contributing to open source.
      </p>
      <div className="about-interests">
        <span className="interest"><Mountain size={13} /> Rock Climbing</span>
        <span className="interest"><Coffee size={13} /> Coffee</span>
        <span className="interest"><Code2 size={13} /> Open Source</span>
        <span className="interest"><Sparkles size={13} /> Generative Art</span>
      </div>
    </section>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'about', label: 'About' },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app">
      {/* Background grain */}
      <div className="bg-grain" />
      <div className="bg-glow" />

      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-brand">AM</div>
        <div className="navbar-links">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${activeSection === item.id ? 'nav-link--active' : ''}`}
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <a href="mailto:alex.morgan@email.com" className="navbar-cta">
          Hire me
        </a>
      </nav>

      {/* Main layout */}
      <div className="layout">
        <main className="content">
          <Hero />
          <ExperienceSection />
          <ProjectsSection />
          <SkillsSection />
          <EducationSection />
          <AboutSection />

          <footer className="footer">
            <span>Built with React + FastAPI + OpenRouter</span>
            <span className="footer-sep">·</span>
            <span>Alex Morgan © 2024</span>
          </footer>
        </main>

        {/* Sticky AI Chat */}
        <aside className="sidebar">
          <div className="sidebar-sticky">
            <ChatPanel />
            <div className="sidebar-note">
              <Sparkles size={11} />
              AI trained on Alex's actual resume data
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
