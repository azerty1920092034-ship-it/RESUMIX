import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

axios.defaults.withCredentials = true;
const API = "http://localhost:5000";
const FREE_LIMIT = 6;
const BOOK_QUESTION_LIMIT = 16;

const BOOKS = {
  "College": {
    "Mathematiques": [
      { title: "Prealgebra", source: "OpenStax", url: "https://openstax.org/books/prealgebra-2e/pages/1-introduction" },
      { title: "Elementary Algebra", source: "OpenStax", url: "https://openstax.org/books/elementary-algebra-2e/pages/1-introduction" },
      { title: "CK-12 Algebra Basics", source: "CK-12", url: "https://www.ck12.org/book/ck-12-algebra-basic/" },
    ],
    "Sciences": [
      { title: "CK-12 Life Science", source: "CK-12", url: "https://www.ck12.org/book/ck-12-life-science-for-middle-school/" },
      { title: "CK-12 Earth Science", source: "CK-12", url: "https://www.ck12.org/book/ck-12-earth-science-for-middle-school/" },
      { title: "CK-12 Physical Science", source: "CK-12", url: "https://www.ck12.org/book/ck-12-physical-science-for-middle-school/" },
    ],
    "Litterature": [
      { title: "Fables de La Fontaine", source: "Domaine public", url: "https://www.gutenberg.org/ebooks/author/153" },
      { title: "Les Miserables", source: "Victor Hugo", url: "https://www.gutenberg.org/ebooks/135" },
      { title: "Le Comte de Monte-Cristo", source: "Alexandre Dumas", url: "https://www.gutenberg.org/ebooks/1276" },
    ],
    "Education civique": [
      { title: "Introduction to Law", source: "OER Commons", url: "https://oercommons.org" },
      { title: "Civics and Government", source: "CK-12", url: "https://www.ck12.org/book/ck-12-civics/" },
    ],
  },
  "Lycee": {
    "Mathematiques": [
      { title: "Algebra and Trigonometry", source: "OpenStax", url: "https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction-to-prerequisites" },
      { title: "Precalculus 2e", source: "OpenStax", url: "https://openstax.org/books/precalculus-2e/pages/1-introduction-to-functions" },
      { title: "Calculus Volume 1", source: "OpenStax", url: "https://openstax.org/books/calculus-volume-1/pages/1-introduction" },
      { title: "Calculus Volume 2", source: "OpenStax", url: "https://openstax.org/books/calculus-volume-2/pages/1-introduction" },
    ],
    "Sciences": [
      { title: "Biology 2e", source: "OpenStax", url: "https://openstax.org/books/biology-2e/pages/1-introduction" },
      { title: "Chemistry 2e", source: "OpenStax", url: "https://openstax.org/books/chemistry-2e/pages/1-introduction" },
      { title: "Physics (Algebra-Based)", source: "OpenStax", url: "https://openstax.org/books/college-physics-2e/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units" },
    ],
    "Informatique": [
      { title: "CS Principles", source: "OpenStax", url: "https://openstax.org/books/introduction-computer-science/pages/1-introduction" },
      { title: "How to Think Like a Computer Scientist", source: "Runestone", url: "https://runestone.academy/ns/books/published/thinkcspy/index.html" },
    ],
    "Economie": [
      { title: "Principles of Economics 3e", source: "OpenStax", url: "https://openstax.org/books/principles-economics-3e/pages/1-introduction" },
      { title: "Principles of Microeconomics", source: "OpenStax", url: "https://openstax.org/books/principles-microeconomics-3e/pages/1-introduction" },
    ],
    "Droit": [
      { title: "Business Law I Essentials", source: "OpenStax", url: "https://openstax.org/books/business-law-i-essentials/pages/1-introduction" },
      { title: "Foundations of Business Law", source: "Saylor Academy", url: "https://learn.saylor.org/course/BUS205" },
    ],
  },
  "Universite Licence": {
    "Mathematiques": [
      { title: "Introductory Statistics", source: "OpenStax", url: "https://openstax.org/books/introductory-statistics/pages/1-introduction" },
      { title: "Calculus Vol. 1", source: "OpenStax", url: "https://openstax.org/books/calculus-volume-1/pages/1-introduction" },
    ],
    "Sciences": [
      { title: "University Physics Vol. 1", source: "OpenStax", url: "https://openstax.org/books/university-physics-volume-1/pages/1-introduction" },
      { title: "Anatomy and Physiology 2e", source: "OpenStax", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction" },
      { title: "Microbiology", source: "OpenStax", url: "https://openstax.org/books/microbiology/pages/1-introduction" },
    ],
    "Medecine": [
      { title: "Anatomy and Physiology 2e", source: "OpenStax", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction" },
      { title: "Nutrition Science", source: "LibreTexts", url: "https://med.libretexts.org" },
    ],
    "Informatique": [
      { title: "Foundations of Python Programming", source: "Runestone", url: "https://runestone.academy" },
      { title: "SICP", source: "MIT Press", url: "https://mitpress.mit.edu/9780262510875/structure-and-interpretation-of-computer-programs/" },
      { title: "OpenIntro Statistics", source: "OpenIntro", url: "https://www.openintro.org/book/os/" },
    ],
    "Economie": [
      { title: "Principles of Finance", source: "OpenStax", url: "https://openstax.org/books/principles-finance/pages/1-introduction" },
      { title: "Business Ethics", source: "OpenStax", url: "https://openstax.org/books/business-ethics/pages/1-introduction" },
      { title: "Entrepreneurship", source: "OpenStax", url: "https://openstax.org/books/entrepreneurship/pages/1-introduction" },
    ],
    "Psychologie": [
      { title: "Psychology 2e", source: "OpenStax", url: "https://openstax.org/books/psychology-2e/pages/1-introduction" },
      { title: "Sociology 3e", source: "OpenStax", url: "https://openstax.org/books/introduction-sociology-3e/pages/1-introduction" },
      { title: "Introduction to Philosophy", source: "OpenStax", url: "https://openstax.org/books/introduction-philosophy/pages/1-introduction" },
    ],
    "Droit": [
      { title: "Introduction to Law and Legal Systems", source: "Saylor", url: "https://learn.saylor.org/course/LAW101" },
      { title: "Contract Law", source: "Saylor", url: "https://learn.saylor.org/course/LAW103" },
      { title: "Criminal Law", source: "Saylor", url: "https://learn.saylor.org/course/LAW104" },
      { title: "Constitutional Law", source: "Saylor", url: "https://learn.saylor.org/course/LAW201" },
      { title: "International Law", source: "Saylor", url: "https://learn.saylor.org/course/LAW202" },
    ],
  },
  "Master": {
    "Mathematiques avancees": [
      { title: "Advanced Statistics", source: "LibreTexts", url: "https://stats.libretexts.org" },
      { title: "Linear Algebra with Applications", source: "LibreTexts", url: "https://math.libretexts.org" },
    ],
    "Droit avance": [
      { title: "Advanced Topics in International Law", source: "Saylor", url: "https://learn.saylor.org" },
      { title: "Law and Economics", source: "Saylor", url: "https://learn.saylor.org" },
    ],
  },
};

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [language, setLanguage] = useState("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showProModal, setShowProModal] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [schema, setSchema] = useState("");
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [qcm, setQcm] = useState(null);
  const [qcmLoading, setQcmLoading] = useState(false);
  const [qcmAnswers, setQcmAnswers] = useState({});
  const [qcmResult, setQcmResult] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  // Upload states
  const fileInputRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Library states
  const [selectedLevel, setSelectedLevel] = useState("College");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookText, setBookText] = useState("");
  const [bookQuestion, setBookQuestion] = useState("");
  const [bookAnswer, setBookAnswer] = useState("");
  const [bookAnswerLoading, setBookAnswerLoading] = useState(false);
  const [bookExercises, setBookExercises] = useState(null);
  const [bookExercisesLoading, setBookExercisesLoading] = useState(false);
  const [bookAnswers, setBookAnswers] = useState({});
  const [bookResult, setBookResult] = useState(null);
  const [bookUsage, setBookUsage] = useState({});
  const [questionsLeft, setQuestionsLeft] = useState(BOOK_QUESTION_LIMIT);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  useEffect(() => {
    checkSession();
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "approved") {
      alert("Paiement reussi ! Vous etes maintenant PRO !");
      window.history.replaceState({}, "", "/");
      checkSession();
    }
  }, []);

  useEffect(() => {
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    setCharCount(text.length);
  }, [text]);

  const checkSession = async () => {
    try {
      const res = await axios.get(`${API}/auth/me`);
      if (res.data.user) { setUser(res.data.user); setPage("home"); }
    } catch {}
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API}/api/history`);
      setHistory(res.data.summaries);
    } catch {}
  };

  const loadBookUsage = async () => {
    try {
      const res = await axios.get(`${API}/library/usage`);
      setBookUsage(res.data.usage);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === "history" || activeTab === "profile") loadHistory();
    if (activeTab === "library") loadBookUsage();
  }, [activeTab]);

  useEffect(() => {
    if (selectedBook) {
      const used = bookUsage[selectedBook.title] || 0;
      setQuestionsLeft(BOOK_QUESTION_LIMIT - used);
    }
  }, [selectedBook, bookUsage]);

  // Upload file handler
  const handleFileUpload = async (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(file.type)) {
      alert("Format non supporte. Utilisez PDF, DOCX ou TXT.");
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/upload/extract`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setText(res.data.text);
      setUploadedFile({ name: file.name, wordCount: res.data.wordCount });
      setSummary(""); setSchema(""); setQcm(null); setQcmResult(null);
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'extraction du fichier.");
    }
    setUploadLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleRegister = async () => {
    setAuthLoading(true); setAuthError("");
    try {
      const res = await axios.post(`${API}/auth/register`, form);
      setUser(res.data.user); setPage("home");
    } catch (err) { setAuthError(err.response?.data?.error || "Erreur inscription"); }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    setAuthLoading(true); setAuthError("");
    try {
      const res = await axios.post(`${API}/auth/login`, { email: form.email, password: form.password });
      setUser(res.data.user); setPage("home");
    } catch (err) { setAuthError(err.response?.data?.error || "Erreur connexion"); }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await axios.get(`${API}/auth/logout`);
    setUser(null); setPage("login");
    setText(""); setSummary(""); setSchema(""); setQcm(null); setQcmResult(null); setUploadedFile(null);
  };

  const handleGoogleLogin = () => { window.location.href = `${API}/auth/google`; };

  const openForgotPassword = () => {
    setForgotEmail(form.email); setForgotStep(1);
    setForgotError(""); setForgotSuccess("");
    setForgotCode(""); setForgotNewPassword("");
    setShowForgotPassword(true);
  };

  const sendForgotCode = async () => {
    setForgotLoading(true); setForgotError("");
    try {
      await axios.post(`${API}/auth/forgot-password`, { email: forgotEmail });
      setForgotStep(2);
    } catch (err) { setForgotError(err.response?.data?.error || "Erreur lors de l'envoi"); }
    setForgotLoading(false);
  };

  const resetPassword = async () => {
    setForgotLoading(true); setForgotError("");
    try {
      await axios.post(`${API}/auth/reset-password`, { email: forgotEmail, code: forgotCode, newPassword: forgotNewPassword });
      setForgotStep(3); setForgotSuccess("Mot de passe modifie avec succes !");
    } catch (err) { setForgotError(err.response?.data?.error || "Erreur"); }
    setForgotLoading(false);
  };

  const summarizeText = async () => {
    if (!text.trim()) { setError("Veuillez entrer un texte."); return; }
    setLoading(true); setError(""); setSummary(""); setSchema(""); setQcm(null); setQcmResult(null);
    try {
      const res = await axios.post(`${API}/api/summarize`, { text, language });
      if (res.data.limitReached) { setShowProModal(true); }
      else { setSummary(res.data.summary); await checkSession(); }
    } catch (err) {
      if (err.response?.data?.limitReached) setShowProModal(true);
      else setError("Impossible de contacter le serveur.");
    }
    setLoading(false);
  };

  const generateSchema = async () => {
    if (!summary) return;
    setSchemaLoading(true);
    try {
      const res = await axios.post(`${API}/api/schema`, { summary });
      setSchema(res.data.schema);
    } catch { alert("Erreur lors de la generation du schema."); }
    setSchemaLoading(false);
  };

  const generateQcm = async () => {
    if (!summary) return;
    setQcmLoading(true); setQcm(null); setQcmAnswers({}); setQcmResult(null);
    try {
      const res = await axios.post(`${API}/api/qcm`, { summary });
      setQcm(res.data);
    } catch { alert("Erreur lors de la generation du QCM."); }
    setQcmLoading(false);
  };

  const submitQcm = () => {
    if (!qcm) return;
    let score = 0;
    qcm.questions.forEach((q, i) => { if (qcmAnswers[i] === q.correct) score++; });
    setQcmResult(score);
  };

  const askBookQuestion = async () => {
    if (!bookText || !bookQuestion) return;
    setBookAnswerLoading(true); setBookAnswer("");
    try {
      const res = await axios.post(`${API}/library/ask`, {
        text: bookText, question: bookQuestion,
        subject: selectedSubject || "General",
        level: selectedLevel,
        bookTitle: selectedBook.title
      });
      setBookAnswer(res.data.answer);
      setQuestionsLeft(res.data.questionsLeft);
      setBookUsage(prev => ({ ...prev, [selectedBook.title]: BOOK_QUESTION_LIMIT - res.data.questionsLeft }));
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setQuestionsLeft(0);
        alert(`Limite de ${BOOK_QUESTION_LIMIT} questions atteinte pour ce livre aujourd'hui !`);
      } else { alert("Erreur lors de la reponse."); }
    }
    setBookAnswerLoading(false);
  };

  const generateBookExercises = async () => {
    if (!bookText) return;
    setBookExercisesLoading(true); setBookExercises(null); setBookAnswers({}); setBookResult(null);
    try {
      const res = await axios.post(`${API}/library/exercises`, {
        text: bookText,
        subject: selectedSubject || "General",
        level: selectedLevel,
        bookTitle: selectedBook.title
      });
      setBookExercises(res.data);
      setQuestionsLeft(res.data.questionsLeft);
      setBookUsage(prev => ({ ...prev, [selectedBook.title]: BOOK_QUESTION_LIMIT - res.data.questionsLeft }));
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setQuestionsLeft(0);
        alert(`Limite atteinte pour ce livre aujourd'hui !`);
      } else { alert("Erreur lors de la generation des exercices."); }
    }
    setBookExercisesLoading(false);
  };

  const submitBookExercises = () => {
    if (!bookExercises) return;
    let score = 0;
    bookExercises.exercises.forEach((ex, i) => {
      if (ex.type !== "texte_libre" && bookAnswers[i] === ex.correct) score++;
    });
    setBookResult(score);
  };

  const payFeda = async () => {
    setPayLoading(true);
    try {
      const res = await axios.post(`${API}/payment/pay`);
      window.location.href = res.data.url;
    } catch { alert("Erreur lors du paiement."); }
    setPayLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const getBookQuestionsLeft = (bookTitle) => {
    const used = bookUsage[bookTitle] || 0;
    return BOOK_QUESTION_LIMIT - used;
  };

  const isTrial = user && Date.now() < new Date(user.trialEnds).getTime();
  const trialHoursLeft = user ? Math.max(0, Math.ceil((new Date(user.trialEnds) - Date.now()) / 3600000)) : 0;
  const remainingFree = user ? Math.max(0, FREE_LIMIT - (user.dailyCount || 0)) : FREE_LIMIT;

  const ForgotModal = () => (
    <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Mot de passe oublie</h2>
        {forgotStep === 1 && (
          <>
            <p className="modal-desc">Entrez votre email pour recevoir un code.</p>
            {forgotError && <div className="auth-error">{forgotError}</div>}
            <input className="auth-input" type="email" placeholder="Votre email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
            <button className="btn-pay-modal" onClick={sendForgotCode} disabled={forgotLoading || !forgotEmail}>{forgotLoading ? "Envoi..." : "Envoyer le code"}</button>
            <button className="btn-cancel" onClick={() => setShowForgotPassword(false)}>Annuler</button>
          </>
        )}
        {forgotStep === 2 && (
          <>
            <p className="modal-desc">Entrez le code recu et votre nouveau mot de passe.</p>
            {forgotError && <div className="auth-error">{forgotError}</div>}
            <input className="auth-input" type="text" placeholder="Code a 6 chiffres" value={forgotCode} onChange={e => setForgotCode(e.target.value)} maxLength={6} />
            <div className="password-wrapper">
              <input className="auth-input" type={showForgotNewPassword ? "text" : "password"} placeholder="Nouveau mot de passe" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} />
              <button className="toggle-password" onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}>{showForgotNewPassword ? "🙈" : "👁️"}</button>
            </div>
            <button className="btn-pay-modal" onClick={resetPassword} disabled={forgotLoading || !forgotCode || !forgotNewPassword}>{forgotLoading ? "Modification..." : "Modifier le mot de passe"}</button>
            <button className="btn-cancel" onClick={() => setShowForgotPassword(false)}>Annuler</button>
          </>
        )}
        {forgotStep === 3 && (
          <>
            <div className="modal-icon">✅</div>
            <p className="modal-desc" style={{color: "green"}}>{forgotSuccess}</p>
            <button className="btn-pay-modal" onClick={() => { setShowForgotPassword(false); setPage("login"); }}>Se connecter</button>
          </>
        )}
      </div>
    </div>
  );

  if (page === "login" || page === "register") {
    return (
      <div className="app">
        <div className="bg-mesh" /><div className="bg-grid" />
        {showForgotPassword && <ForgotModal />}
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="logo-mark">R</div>
              <span className="logo-name">RESUMIX</span>
            </div>
            <h2 className="auth-title">{page === "login" ? "Bon retour !" : "Creer un compte"}</h2>
            <p className="auth-sub">{page === "login" ? "Connectez-vous pour continuer" : "Commencez gratuitement"}</p>
            {authError && <div className="auth-error">{authError}</div>}
            <button className="btn-google" onClick={handleGoogleLogin}>
              <img src="https://www.google.com/favicon.ico" alt="Google" width="18" />
              Continuer avec Google
            </button>
            <div className="auth-divider"><span>ou</span></div>
            {page === "register" && <input className="auth-input" type="text" placeholder="Votre nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
            <input className="auth-input" type="email" placeholder="Adresse email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <div className="password-wrapper">
              <input className="auth-input" type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "🙈" : "👁️"}</button>
            </div>
            {page === "login" && <button className="forgot-link" onClick={openForgotPassword}>Mot de passe oublie ?</button>}
            <button className="btn-primary auth-btn" onClick={page === "login" ? handleLogin : handleRegister} disabled={authLoading}>
              {authLoading ? "Chargement..." : page === "login" ? "Se connecter" : "S'inscrire"}
            </button>
            <p className="auth-switch">
              {page === "login" ? (<>Pas de compte ? <button onClick={() => setPage("register")}>S'inscrire</button></>) : (<>Deja un compte ? <button onClick={() => setPage("login")}>Se connecter</button></>)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="bg-mesh" /><div className="bg-grid" />

      {showProModal && (
        <div className="modal-overlay" onClick={() => setShowProModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🔒</div>
            <h2 className="modal-title">Limite atteinte</h2>
            <p className="modal-desc">Vous avez utilise vos {FREE_LIMIT} resumes gratuits du jour.</p>
            <div className="modal-price"><span className="price">3 000 FCFA</span><span className="price-period">/ mois</span></div>
            <ul className="modal-features"><li>Resumes illimites</li><li>Historique complet</li><li>QCM illimites</li></ul>
            <button className="btn-pay-modal" onClick={payFeda} disabled={payLoading}>{payLoading ? "Redirection..." : "Passer au PRO via FedaPay"}</button>
            <button className="btn-cancel" onClick={() => setShowProModal(false)}>Continuer gratuitement demain</button>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-left">
          <div className="logo-mark">R</div>
          <div className="logo-text">
            <span className="logo-name">RESUMIX</span>
            <span className="logo-tagline">Intelligence de resume</span>
          </div>
        </div>
        <div className="header-right">
          {user && !user.isPro && (isTrial ? <div className="trial-badge">Essai - {trialHoursLeft}h</div> : <div className="usage-badge">{remainingFree}/{FREE_LIMIT} restants</div>)}
          {user?.isPro && <div className="pro-badge-header">PRO</div>}
          {user && (
            <div className="user-menu">
              {user.avatar && <img src={user.avatar} alt="avatar" className="user-avatar" />}
              <span className="user-name">{user.name}</span>
              <button className="btn-logout" onClick={handleLogout}>Deconnexion</button>
            </div>
          )}
        </div>
      </header>

      <nav className="nav-tabs">
        {["home", "history", "library", "profile"].map(tab => (
          <button key={tab} className={`nav-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab === "home" ? "Resumer" : tab === "history" ? "Historique" : tab === "library" ? "Bibliotheque" : "Profil"}
          </button>
        ))}
      </nav>

      <main className="main">

        {/* HOME TAB */}
        {activeTab === "home" && (
          <>
            <div className="hero">
              <h1 className="hero-title">Resumez n'importe quel texte<span className="hero-accent"> en secondes</span></h1>
              <p className="hero-sub">Propulse par l'IA - Multilingue - Gratuit</p>
            </div>
            <div className="editor-layout">
              <div className="panel panel-input">
                <div className="panel-header">
                  <span className="panel-label">Texte original</span>
                  <div className="panel-actions">
                    <select className="lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="fr">Francais</option><option value="en">English</option>
                      <option value="es">Espanol</option><option value="ar">Arabe</option>
                      <option value="zh">Chinois</option><option value="pt">Portugais</option>
                    </select>
                    {text && <button className="btn-ghost" onClick={() => { setText(""); setSummary(""); setSchema(""); setQcm(null); setQcmResult(null); setUploadedFile(null); }}>Effacer</button>}
                  </div>
                </div>

                {/* File upload zone */}
                <div
                  className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    style={{display: "none"}}
                    onChange={e => handleFileUpload(e.target.files[0])}
                  />
                  {uploadLoading ? (
                    <div className="upload-loading"><div className="loading-ring"/><p>Extraction en cours...</p></div>
                  ) : uploadedFile ? (
                    <div className="upload-success">
                      <span className="upload-icon">✅</span>
                      <span className="upload-filename">{uploadedFile.name}</span>
                      <span className="upload-wordcount">{uploadedFile.wordCount} mots extraits</span>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📎</span>
                      <span className="upload-text">Cliquez ou glissez un fichier ici</span>
                      <span className="upload-hint">PDF, DOCX, TXT · Max 10MB</span>
                    </div>
                  )}
                </div>

                <textarea className="editor-textarea" value={text} onChange={e => setText(e.target.value)} placeholder="Ou collez/tapez votre texte ici..." />
                <div className="panel-footer">
                  <div className="stats"><span className="stat">{wordCount} mots</span><span className="stat-divider">.</span><span className="stat">{charCount} caracteres</span></div>
                  <button className="btn-primary" onClick={summarizeText} disabled={loading || !text.trim()}>
                    {loading ? <span className="btn-loading"><span className="dot-1"/><span className="dot-2"/><span className="dot-3"/></span> : "Resumer ->"}
                  </button>
                </div>
              </div>

              <div className="panel panel-output">
                <div className="panel-header">
                  <span className="panel-label">Resume</span>
                  {summary && <button className="btn-copy" onClick={copyToClipboard}>{copied ? "Copie !" : "Copier"}</button>}
                </div>
                <div className="output-area">
                  {loading ? <div className="loading-state"><div className="loading-ring"/><p>Analyse en cours...</p></div>
                  : error ? <div className="error-state"><p>{error}</p></div>
                  : summary ? <div className="summary-text">{summary}</div>
                  : <div className="empty-state"><div className="empty-icon">📄</div><p>Votre resume apparaitra ici</p></div>}
                </div>
                {summary && (
                  <div className="panel-footer">
                    <div className="stats">
                      <span className="stat">{summary.trim().split(/\s+/).length} mots</span>
                      <span className="stat-divider">.</span>
                      <span className="stat reduction">{wordCount > 0 ? Math.round((1 - summary.trim().split(/\s+/).length / wordCount) * 100) : 0}% reduction</span>
                    </div>
                    <div className="action-buttons">
                      <button className="btn-secondary" onClick={generateSchema} disabled={schemaLoading}>{schemaLoading ? "Generation..." : "Schema"}</button>
                      <button className="btn-secondary" onClick={generateQcm} disabled={qcmLoading}>{qcmLoading ? "Generation..." : "QCM"}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {schema && <div className="panel schema-panel"><div className="panel-header"><span className="panel-label">Schema conceptuel</span></div><pre className="schema-content">{schema}</pre></div>}

            {qcm && !qcmResult && (
              <div className="panel qcm-panel">
                <div className="panel-header"><span className="panel-label">QCM - {qcm.questions.length} questions</span></div>
                <div className="qcm-content">
                  {qcm.questions.map((q, i) => (
                    <div key={i} className="qcm-question">
                      <p className="question-text">{i + 1}. {q.question}</p>
                      <div className="options-grid">
                        {q.options.map((opt, j) => <button key={j} className={`option-btn ${qcmAnswers[i] === j ? "selected" : ""}`} onClick={() => setQcmAnswers({ ...qcmAnswers, [i]: j })}>{String.fromCharCode(65 + j)}. {opt}</button>)}
                      </div>
                    </div>
                  ))}
                  <button className="btn-primary submit-qcm" onClick={submitQcm} disabled={Object.keys(qcmAnswers).length < qcm.questions.length}>Soumettre</button>
                </div>
              </div>
            )}

            {qcmResult !== null && qcm && (
              <div className="panel qcm-panel">
                <div className="panel-header"><span className="panel-label">Resultats</span></div>
                <div className="qcm-results">
                  <div className="score-circle"><span className="score-number">{qcmResult}</span><span className="score-total">/{qcm.questions.length}</span></div>
                  <p className="score-label">{qcmResult >= 8 ? "Excellent !" : qcmResult >= 5 ? "Bien joue !" : "Continuez a apprendre !"}</p>
                  <div className="qcm-review">
                    {qcm.questions.map((q, i) => (
                      <div key={i} className={`review-item ${qcmAnswers[i] === q.correct ? "correct" : "incorrect"}`}>
                        <p className="review-question">{i + 1}. {q.question}</p>
                        <p className="review-answer">{qcmAnswers[i] === q.correct ? "✅" : "❌"} {q.options[qcmAnswers[i]]}</p>
                        {qcmAnswers[i] !== q.correct && <p className="review-correct">Bonne reponse : {q.options[q.correct]}</p>}
                      </div>
                    ))}
                  </div>
                  <button className="btn-secondary" onClick={() => { setQcm(null); setQcmResult(null); setQcmAnswers({}); }}>Nouveau QCM</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="history-section">
            <h2 className="section-title">Historique des resumes</h2>
            {history.length === 0 ? <div className="empty-state"><div className="empty-icon">📚</div><p>Aucun resume pour le moment</p></div> : (
              <div className="history-list">
                {history.map((item, i) => (
                  <div key={i} className="history-item" onClick={() => { setSummary(item.summary); setText(item.originalText); setActiveTab("home"); }}>
                    <div className="history-header">
                      <span className="history-date">{new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                      <span className="history-reduction">{item.reductionPercent}% de reduction</span>
                    </div>
                    <p className="history-preview">{item.summary.substring(0, 150)}...</p>
                    <div className="history-stats"><span>{item.wordCountOriginal} mots → {item.wordCountSummary} mots</span><span className="history-lang">{item.language}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === "library" && (
          <div className="library-section">
            <h2 className="section-title">Bibliotheque</h2>
            <p className="section-sub">Explorez des livres gratuits et travaillez avec l'IA · 16 questions par livre par jour</p>
            <div className="level-tabs">
              {Object.keys(BOOKS).map(level => (
                <button key={level} className={`level-tab ${selectedLevel === level ? "active" : ""}`} onClick={() => { setSelectedLevel(level); setSelectedSubject(null); setSelectedBook(null); }}>{level}</button>
              ))}
            </div>
            <div className="subject-grid">
              {Object.keys(BOOKS[selectedLevel]).map(subject => (
                <button key={subject} className={`subject-card ${selectedSubject === subject ? "active" : ""}`} onClick={() => { setSelectedSubject(subject); setSelectedBook(null); }}>{subject}</button>
              ))}
            </div>
            {selectedSubject && (
              <div className="books-grid">
                {BOOKS[selectedLevel][selectedSubject].map((book, i) => {
                  const qLeft = getBookQuestionsLeft(book.title);
                  const isLimited = qLeft <= 0;
                  return (
                    <div key={i} className={`book-card ${selectedBook?.title === book.title ? "active" : ""} ${isLimited ? "limited" : ""}`}>
                      <div className="book-icon">📖</div>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-source">{book.source}</p>
                        <div className={`book-questions-badge ${isLimited ? "exhausted" : qLeft <= 5 ? "low" : ""}`}>
                          {isLimited ? "0 questions restantes" : `${qLeft}/${BOOK_QUESTION_LIMIT} questions restantes`}
                        </div>
                      </div>
                      <div className="book-actions">
                        <a href={book.url} target="_blank" rel="noreferrer" className="btn-open-book">Ouvrir</a>
                        <button className="btn-work-book" onClick={() => { setSelectedBook(book); setBookText(""); setBookAnswer(""); setBookExercises(null); setBookResult(null); setBookAnswers({}); }} disabled={isLimited} style={isLimited ? {opacity: 0.4, cursor: "not-allowed"} : {}}>
                          {isLimited ? "Limite" : "Travailler"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedBook && (
              <div className="book-workspace">
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-label">Travailler avec : {selectedBook.title}</span>
                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                      <span className={`book-questions-badge ${questionsLeft <= 5 ? "low" : ""}`}>{questionsLeft} questions restantes</span>
                      <button className="btn-ghost" onClick={() => setSelectedBook(null)}>Fermer</button>
                    </div>
                  </div>
                  <div style={{padding: "20px"}}>
                    <p style={{color: "var(--text2)", fontSize: "0.85rem", marginBottom: "12px"}}>Ouvrez le livre, copiez un extrait et collez-le ici.</p>
                    <textarea className="editor-textarea" style={{minHeight: "150px"}} value={bookText} onChange={e => setBookText(e.target.value)} placeholder="Collez un extrait du livre ici..." />
                    {bookText && questionsLeft > 0 && (
                      <>
                        <div style={{marginTop: "16px"}}>
                          <p className="panel-label" style={{marginBottom: "8px"}}>Poser une question</p>
                          <div style={{display: "flex", gap: "8px"}}>
                            <input className="auth-input" style={{flex: 1, marginBottom: 0}} type="text" placeholder="Posez votre question..." value={bookQuestion} onChange={e => setBookQuestion(e.target.value)} />
                            <button className="btn-primary" onClick={askBookQuestion} disabled={bookAnswerLoading || !bookQuestion}>{bookAnswerLoading ? "..." : "Demander"}</button>
                          </div>
                          {bookAnswer && <div className="book-answer"><p className="panel-label" style={{marginBottom: "8px"}}>Reponse :</p><div className="summary-text">{bookAnswer}</div></div>}
                        </div>
                        <div style={{marginTop: "20px"}}>
                          <button className="btn-primary" onClick={generateBookExercises} disabled={bookExercisesLoading}>{bookExercisesLoading ? "Generation..." : "Generer des exercices"}</button>
                        </div>
                        {bookExercises && !bookResult && (
                          <div style={{marginTop: "20px"}}>
                            <p className="panel-label" style={{marginBottom: "16px"}}>Exercices :</p>
                            {bookExercises.exercises.map((ex, i) => (
                              <div key={i} className="qcm-question">
                                <p className="question-text">{i + 1}. {ex.question}</p>
                                {ex.type === "texte_libre" ? <div className="book-answer"><p style={{color: "var(--text2)", fontSize: "0.85rem"}}>Question ouverte.</p></div> : (
                                  <div className="options-grid">
                                    {ex.options.map((opt, j) => <button key={j} className={`option-btn ${bookAnswers[i] === j ? "selected" : ""}`} onClick={() => setBookAnswers({ ...bookAnswers, [i]: j })}>{String.fromCharCode(65 + j)}. {opt}</button>)}
                                  </div>
                                )}
                              </div>
                            ))}
                            <button className="btn-primary submit-qcm" onClick={submitBookExercises} disabled={Object.keys(bookAnswers).length < bookExercises.exercises.filter(e => e.type !== "texte_libre").length}>Voir les corrections</button>
                          </div>
                        )}
                        {bookResult !== null && bookExercises && (
                          <div style={{marginTop: "20px"}}>
                            <div className="qcm-results">
                              <div className="score-circle"><span className="score-number">{bookResult}</span><span className="score-total">/{bookExercises.exercises.filter(e => e.type !== "texte_libre").length}</span></div>
                              <p className="score-label">{bookResult >= 4 ? "Excellent !" : bookResult >= 2 ? "Bien joue !" : "Continuez a apprendre !"}</p>
                              <div className="qcm-review">
                                {bookExercises.exercises.map((ex, i) => (
                                  <div key={i} className={`review-item ${ex.type === "texte_libre" ? "correct" : bookAnswers[i] === ex.correct ? "correct" : "incorrect"}`}>
                                    <p className="review-question">{i + 1}. {ex.question}</p>
                                    {ex.type === "texte_libre" ? <p className="review-correct">Reponse : {ex.explanation}</p> : (
                                      <>
                                        <p className="review-answer">{bookAnswers[i] === ex.correct ? "✅" : "❌"} {ex.options[bookAnswers[i]]}</p>
                                        {bookAnswers[i] !== ex.correct && <p className="review-correct">Bonne reponse : {ex.options[ex.correct]}</p>}
                                        <p className="review-correct">{ex.explanation}</p>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <button className="btn-secondary" onClick={() => { setBookExercises(null); setBookResult(null); setBookAnswers({}); }}>Nouveaux exercices</button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {questionsLeft <= 0 && (
                      <div className="empty-state" style={{marginTop: "20px"}}>
                        <div className="empty-icon">🔒</div>
                        <p>Limite de {BOOK_QUESTION_LIMIT} questions atteinte pour ce livre aujourd'hui.</p>
                        <p style={{fontSize: "0.82rem", color: "var(--text3)"}}>Essayez un autre livre ou revenez demain !</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && user && (
          <div className="profile-section">
            <h2 className="section-title">Mon profil</h2>
            <div className="profile-card">
              <div className="profile-avatar">
                {user.avatar ? <img src={user.avatar} alt="avatar" className="profile-img" /> : <div className="profile-initials">{user.name.charAt(0).toUpperCase()}</div>}
              </div>
              <div className="profile-info">
                <h3 className="profile-name">{user.name}</h3>
                <p className="profile-email">{user.email}</p>
                <div className={`profile-plan ${user.isPro ? "pro" : "free"}`}>{user.isPro ? "Plan PRO" : "Plan Gratuit"}</div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="profile-stat-card"><span className="stat-icon">📄</span><span className="stat-value">{history.length}</span><span className="stat-label">Resumes</span></div>
              <div className="profile-stat-card"><span className="stat-icon">📅</span><span className="stat-value">{remainingFree}</span><span className="stat-label">Restants aujourd'hui</span></div>
              <div className="profile-stat-card"><span className="stat-icon">{user.isPro ? "⭐" : "🔓"}</span><span className="stat-value">{user.isPro ? "PRO" : "FREE"}</span><span className="stat-label">Abonnement</span></div>
            </div>
            {!user.isPro && <button className="btn-upgrade" onClick={() => setShowProModal(true)}>Passer au PRO - 3 000 FCFA/mois</button>}
          </div>
        )}

      </main>
      <footer className="footer"><p>2025 RESUMIX - Propulse par Groq AI</p></footer>
    </div>
  );
}

export default App;