import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Plan smarter</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Your monthly money command center.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Budget Pro helps households track recurring expenses, monitor
          mortgage and loan obligations, and keep credit card fees from
          draining monthly cashflow. Use the home dashboard to update
          categories and compare planned spending against take-home income.
        </p>
      </section>
    </main>
  )
}
