import { useState } from 'react'

// A password box with a Show/Hide button. Other props go straight to the <input>.
function PasswordInput(props) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="password-input">
      <input {...props} className="input" type={isVisible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export default PasswordInput
