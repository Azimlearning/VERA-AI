import Link from 'next/link';
import { FaChartLine, FaFileAlt, FaImages, FaPodcast, FaQuestionCircle, FaUsers } from 'react-icons/fa';

const demos = [
  {
    title: 'Analytics Agent',
    icon: FaChartLine,
    input: 'Monthly production CSV with asset, planned output, actual output, downtime, and variance fields.',
    output: 'Highlights output gaps, flags abnormal downtime, and summarizes likely operational drivers.',
    href: '/agents/analytics',
  },
  {
    title: 'Meetings Agent',
    icon: FaUsers,
    input: 'Project meeting transcript with owners, blockers, decisions, and follow-up items.',
    output: 'Creates executive summary, decisions, action items, owners, risks, and alignment notes.',
    href: '/agents/meetings',
  },
  {
    title: 'Podcast Agent',
    icon: FaPodcast,
    input: 'A Systemic Shifts topic or pasted source content for an internal communications episode.',
    output: 'Generates a structured host-style podcast script for stakeholder communication.',
    href: '/agents/podcast',
  },
  {
    title: 'Content Agent',
    icon: FaFileAlt,
    input: 'Campaign story prompt, department context, key shifts, and intended audience.',
    output: 'Drafts a polished internal story and optional visual concept for communications.',
    href: '/agents/content',
  },
  {
    title: 'Visual Agent',
    icon: FaImages,
    input: 'Operational image or campaign visual requiring tags, description, and interpretation.',
    output: 'Returns visual tags, metadata-style summary, detected themes, and recommended usage.',
    href: '/agents/visual',
  },
  {
    title: 'Quiz Agent',
    icon: FaQuestionCircle,
    input: 'Knowledge base text, policy summary, or transformation initiative content.',
    output: 'Builds a quiz with answer options, scoring, and explanation prompts.',
    href: '/agents/quiz',
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Presentation Demo</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">VERA-AI example flows</h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                A compact walkthrough of the demo inputs and expected outputs used to showcase the six agent workflows.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/setup" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700">
                Setup keys
              </Link>
              <Link href="/" className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
                Open app
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-8 md:grid-cols-2 md:px-8 xl:grid-cols-3">
        {demos.map((demo) => {
          const Icon = demo.icon;

          return (
            <article key={demo.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-semibold">{demo.title}</h2>
              </div>
              <div className="mt-5 grid gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-700">Demo input</p>
                  <p className="mt-1 text-slate-600">{demo.input}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Expected output</p>
                  <p className="mt-1 text-slate-600">{demo.output}</p>
                </div>
              </div>
              <Link href={demo.href} className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-900">
                Try this agent
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
