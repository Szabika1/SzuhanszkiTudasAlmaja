import { useEffect, useState } from "react"

function UserProfile({ setUser }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    password: "",
  })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  // profil betöltése az oldal megnyitásakor
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("http://localhost:3001/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.message || "Hiba történt!")
        } else {
          setForm((prev) => ({ ...prev, name: data.name, email: data.email }))
        }
      } catch (err) {
        setError("Nem sikerült kapcsolódni a szerverhez!")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [token])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage("")
    setError("")

    // a jelszó mezőket csak akkor küldjük, ha ki vannak töltve
    const body = { name: form.name, email: form.email }
    if (form.password) {
      body.password = form.password
      body.currentPassword = form.currentPassword
    }

    try {
      const res = await fetch("http://localhost:3001/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Hiba történt!")
        return
      }

      setMessage(data.message)
      setForm((prev) => ({ ...prev, currentPassword: "", password: "" }))

      // a localStorage-ban és az App state-ben is frissítjük a nevet
      const savedUser = JSON.parse(localStorage.getItem("user"))
      const updatedUser = { ...savedUser, name: form.name }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (err) {
      setError("Nem sikerült kapcsolódni a szerverhez!")
    }
  }

  if (loading) return <div className="container mt-4">Betöltés...</div>

  return (
    <div className="container mt-4" style={{ maxWidth: "500px" }}>
      <h2 className="mb-3">Profilom</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Név</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <hr />
        <p className="text-muted">
          Jelszócseréhez töltsd ki a lenti mezőket, egyébként hagyd üresen.
        </p>

        <div className="mb-3">
          <label className="form-label">Jelenlegi jelszó</label>
          <input
            type="password"
            name="currentPassword"
            className="form-control"
            value={form.currentPassword}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Új jelszó</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            minLength={8}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Mentés
        </button>
      </form>
    </div>
  )
}

export default UserProfile