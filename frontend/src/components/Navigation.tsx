import { NavLink } from 'react-router-dom';
<li>
  <NavLink to="/exams" className={({ isActive }: { isActive: boolean }) => isActive ? 'active' : ''}>
    Exams
  </NavLink>
</li> 