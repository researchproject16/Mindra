import React, { useEffect, useState } from 'react';
import API from '../api';

export default function ModulePage({ moduleId, onDone }) {
  const [module, setModule] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    async function load() {
      const m = await API.get(`/modules/${moduleId}`);
      setModule(m.data);
      const q = await API.get(`/quiz/${moduleId}`);
      setQuiz(q.data);
    }
    load();
  }, [moduleId]);

  if (!module) return <div>Loading...</div>;

  const handleChoose = (qId, idx) => setAnswers(a => ({ ...a, [qId]: idx }));

  const submit = async () => {
    const payload = {
      moduleId,
      answers: Object.entries(answers).map(([qId, selectedIndex]) => ({ qId, selectedIndex: Number(selectedIndex) }))
    };
    try {
      const res = await API.post('/submit', payload);
      alert(`Score: ${res.data.score}% (${res.data.correct}/${res.data.total})`);
      onDone();
    } catch (err) {
      alert(err.response?.data?.error || 'Submit failed');
    }
  };

  return (
    <div>
      <h2>{module.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: module.content }} />
      <hr />
      <h3>Quiz</h3>
      {quiz.map(q => (
        <div key={q.id} className="quiz-card">
          <p>{q.text}</p>
          <div>
            {q.options.map((opt, i) => (
              <label key={i} className="option">
                <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => handleChoose(q.id, i)} />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="row">
        <button onClick={submit}>Submit Answers</button>
        <button onClick={onDone} className="muted">Back</button>
      </div>
    </div>
  );
}
