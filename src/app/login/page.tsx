import AuthForm from './auth-form'

export default function Home() {
  return (
    <div className="row">
      <div className="col-6">
        <h1 className="header">Local Made</h1>
        <p className="">
          Find local artisans!
          Enter your email and follow the link to sign in.
        </p>
      </div>
      <div className="col-6 auth-widget">
        <AuthForm />
      </div>
    </div>
  )
}
