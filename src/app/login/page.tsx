import AuthForm from './auth-form';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="header">Local Made</h1>
      <h2 className="header">Artist Sign In</h2>
      <p style={{ margin: '20px 0' }}>
        Account sign in and sign up for artists.
      </p>
      <div style={{ width: '300px', margin: '0 auto' }}>
        <AuthForm />
      </div>
    </div>
  );
}



