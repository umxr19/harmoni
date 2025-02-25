import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { QuestionList } from './pages/QuestionList';
import { CreateQuestion } from './pages/CreateQuestion';
import { EditQuestion } from './pages/EditQuestion';
import { QuestionDetail } from './pages/QuestionDetail';
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="questions" element={<QuestionList />} />
          <Route path="questions/create" element={<CreateQuestion />} />
          <Route path="questions/edit/:id" element={<EditQuestion />} />
          <Route path="questions/:id" element={<QuestionDetail />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
