import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import '../styles/pages/help.css'

const QUESTIONS = [
  {
    question: 'What is the difference between a lost and a found report?',
    answer:
      "A lost report asks people to look out for something you lost. A found report lists something you picked up so the owner can claim it. Only found items can be claimed.",
  },
  {
    question: 'Why do I have to answer a question to claim something?',
    answer:
      "The finder sets a question only the real owner would know, like what sticker is on a bottle. Findr checks your answer straight away. If it doesn't match, no claim is made. This stops people claiming things that aren't theirs.",
  },
  {
    question: 'Can the finder see my answer?',
    answer:
      "No. Findr only keeps a scrambled (hashed) version of the finder's answer to compare against, and your answer isn't stored at all. The finder just sees that it matched.",
  },
  {
    question: 'My answer matched. Now what?',
    answer:
      "The finder looks at your claim and approves or rejects it. You'll get a notification either way. If several people claim the same item, approving one closes the others.",
  },
  {
    question: 'How does the handover work?',
    answer:
      'Once a claim is approved, the finder and the owner pick a time and a place in the dashboard. When the item is handed over, the finder marks it returned and the report closes for good.',
  },
  {
    question: 'I got my item back some other way. What do I do?',
    answer: 'Close your lost report from My lost reports so people stop looking.',
  },
  {
    question: 'Who can see my details?',
    answer:
      'Your name shows on reports you post. Your email and phone are not shown on Findr. Community admins can see the members of their community.',
  },
]

const SAFETY_TIPS = [
  'Meet in a busy public place on campus, like the library desk, a canteen or the security gate.',
  'Hand valuables and ID cards to campus security if you are not comfortable meeting.',
  'Never share OTPs, passwords or bank details to "prove" anything. Findr will never ask for them.',
  "If a claim feels off, reject it or ask a question only the owner would know when you meet.",
]

const TOPICS = ['A problem with a claim', 'Report a fake or abusive listing', 'My account', 'Something else']

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], message: '' })
  const [error, setError] = useState('')
  const [isSent, setIsSent] = useState(false)

  function updateField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim()) || form.message.trim().length < 10) {
      setError('Add your name, a valid email and a message of at least 10 characters.')
      return
    }

    // nowhere to send it until the backend exists (phase 4)
    setError('')
    setIsSent(true)
  }

  if (isSent) {
    return (
      <div className="alert alert-success" role="status">
        Thanks, {form.name.trim().split(' ')[0]}. We got your message and will reply to {form.email.trim()}.
      </div>
    )
  }

  return (
    <form className="help-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="help-form-row">
        <div className="field">
          <label className="field-label" htmlFor="contact-name">
            Name
          </label>
          <input id="contact-name" className="input" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            className="input"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="contact-topic">
          What is it about?
        </label>
        <select id="contact-topic" className="input" value={form.topic} onChange={(event) => updateField('topic', event.target.value)}>
          {TOPICS.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          className="input"
          value={form.message}
          onChange={(event) => updateField('message', event.target.value)}
        />
      </div>

      <Button type="submit">Send message</Button>
    </form>
  )
}

function HelpPage() {
  return (
    <div className="container help-page">
      <header className="help-header">
        <h1>Help and contact</h1>
        <p>How Findr works, how to stay safe, and how to reach us.</p>
      </header>

      <section>
        <h2>Common questions</h2>
        <div className="help-questions">
          {QUESTIONS.map((item) => (
            <details key={item.question} className="help-question">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="card help-safety">
        <h2>Staying safe</h2>
        <ul>
          {SAFETY_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Contact us</h2>
        <p className="help-muted">
          Problem with a claim, a listing that looks fake, or something not working? Tell us. For a claim, the item's
          link helps, e.g. from <Link to="/dashboard/claims">My claims</Link>.
        </p>
        <ContactForm />
      </section>
    </div>
  )
}

export default HelpPage
