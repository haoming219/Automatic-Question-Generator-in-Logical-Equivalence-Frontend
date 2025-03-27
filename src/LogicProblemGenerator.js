import React, { useState } from 'react';
import axios from 'axios';
import './style.css';

function QuestionCard({ q, index }) {
    const [openHint, setOpenHint] = useState(null);
    const [hint1Value, setHint1Value] = useState(null);
    const [hint2Value, setHint2Value] = useState(null);

    const toggleHint = (hintType) => {
        setOpenHint(prev => (prev === hintType ? null : hintType));
    };

    const handleHint1 = () => {
        if (!hint1Value) {
            if (q.used_rules && q.used_rules.length > 0) {
                const randomIndex = Math.floor(Math.random() * q.used_rules.length);
                setHint1Value(q.used_rules[randomIndex]);
            } else {
                setHint1Value("无提示");
            }
        }
        toggleHint("hint1");
    };

    const handleHint2 = () => {
        if (!hint2Value) {
            if (q.used_rules && q.used_rules.length > 1) {
                let availableRules = q.used_rules.slice();
                if (hint1Value) {
                    availableRules = availableRules.filter(rule => rule !== hint1Value);
                }
                if (availableRules.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableRules.length);
                    setHint2Value(availableRules[randomIndex]);
                } else {
                    setHint2Value("无更多提示");
                }
            } else {
                setHint2Value("无更多提示");
            }
        }
        toggleHint("hint2");
    };

    const handleHint3 = () => {
        toggleHint("hint3");
    };

    return (
        <div className="question-card">
            <div className="question-card-header">
                <span className="question-card-title">题目 {index + 1}</span>
            </div>
            <div className="question-card-body">
                <p className="question-text">{q.question}</p>
                <div className="hint-buttons">
                    <button className="hint-button" onClick={handleHint1}>Hint 1</button>
                    <button className="hint-button" onClick={handleHint2}>Hint 2</button>
                    <button className="hint-button" onClick={handleHint3}>Hint 3</button>
                </div>
                {openHint === "hint1" && hint1Value && (
                    <div className="hint-section">
                        <strong>Hint 1:</strong> {hint1Value}
                    </div>
                )}
                {openHint === "hint2" && hint2Value && (
                    <div className="hint-section">
                        <strong>Hint 2:</strong> {hint2Value}
                    </div>
                )}
                {openHint === "hint3" && (
                    <div className="hint-section">
                        <strong>All Hints (倒序):</strong>
                        <ul className="hint-list">
                            {q.used_rules.slice().reverse().map((rule, i) => (
                                <li key={i}>{rule}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

function LogicProblemGenerator() {
    const [studentId, setStudentId] = useState('');
    const [questionNum, setQuestionNum] = useState(5);
    const [ruleNum, setRuleNum] = useState(3);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/generate', {
                student_id: studentId,
                question_num: questionNum,
                rule_num: ruleNum,
            });
            setQuestions(response.data.questions);
            setError(null);
        } catch (err) {
            setError(err.response ? err.response.data.error : '生成题目时出现错误');
            setQuestions([]);
        }
    };

    return (
        <div className="container">
            <div className="left-panel">
                <h2 className="panel-title">输入信息</h2>
                <form className="input-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="studentId">学号:</label>
                        <input
                            type="text"
                            id="studentId"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="questionNum">题目数量:</label>
                        <select
                            id="questionNum"
                            value={questionNum}
                            onChange={(e) => setQuestionNum(e.target.value)}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="ruleNum">最少使用规则数:</label>
                        <select
                            id="ruleNum"
                            value={ruleNum}
                            onChange={(e) => setRuleNum(e.target.value)}
                        >
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                    <button className="submit-button" type="submit">生成题目</button>
                    {error && <div className="error-message">{error}</div>}
                </form>
            </div>
            <div className="right-panel">
                {questions.length > 0 && (
                    <div>
                        <h2 className="questions-title">生成的题目</h2>
                        {questions.map((q, index) => (
                            <QuestionCard key={index} q={q} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LogicProblemGenerator;
