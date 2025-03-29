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
    const [userType, setUserType] = useState('student'); // 'student' 或 'teacher'
    const [studentId, setStudentId] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [questionNum, setQuestionNum] = useState(5);
    const [ruleNum, setRuleNum] = useState(3);
    const [questions, setQuestions] = useState([]);
    const [teacherMessage, setTeacherMessage] = useState('');
    const [error, setError] = useState(null);

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
        setError(null);
        setTeacherMessage('');
        setQuestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (userType === 'teacher') {
                // 老师模式：仅更新参数，不生成题目
                const payload = {
                    secret_key: secretKey,
                    question_num: questionNum,
                    rule_num: ruleNum,
                };
                const response = await axios.post('https://logicgen.onrender.com/generate', payload);
                setTeacherMessage(response.data.message || '参数更新成功');
                setError(null);
            } else {
                // 学生模式：只需输入学号，生成题目
                const payload = { student_id: studentId };
                const response = await axios.post('https://logicgen.onrender.com/generate', payload);
                setQuestions(response.data.questions);
                setError(null);
            }
        } catch (err) {
            setError(err.response ? err.response.data.error : '发生错误');
            setTeacherMessage('');
            setQuestions([]);
        }
    };

    return (
        <div className="app-container">
            <header className="top-bar">
                <div className="logo">LogicGen</div>
                <div className="top-bar-right">
                    <select className="user-type-select" value={userType} onChange={handleUserTypeChange}>
                        <option value="student">学生</option>
                        <option value="teacher">老师</option>
                    </select>
                </div>
            </header>
            <div className="main-container">
                <div className="form-container">
                    <h2 className="form-title">
                        {userType === 'teacher' ? '参数设置' : '请输入学号'}
                    </h2>
                    <form className="input-form" onSubmit={handleSubmit}>
                        {userType === 'teacher' ? (
                            <>
                                <div className="form-group">
                                    <label htmlFor="secretKey">Secret Key:</label>
                                    <input
                                        type="text"
                                        id="secretKey"
                                        value={secretKey}
                                        onChange={(e) => setSecretKey(e.target.value)}
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
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>

                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ruleNum">最少使用规则数:</label>
                                    <select
                                        id="ruleNum"
                                        value={ruleNum}
                                        onChange={(e) => setRuleNum(e.target.value)}
                                    >
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </>
                        ) : (
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
                        )}
                        <button className="submit-button" type="submit">
                            {userType === 'teacher' ? '保存参数' : '生成题目'}
                        </button>
                        {error && <div className="error-message">{error}</div>}
                        {userType === 'teacher' && teacherMessage && (
                            <div className="teacher-message">{teacherMessage}</div>
                        )}
                    </form>
                </div>
                {userType === 'student' && questions.length > 0 && (
                    <div className="cards-container">
                        <h2 className="cards-title">生成的题目</h2>
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
