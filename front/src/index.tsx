import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Outlet, Route, Routes, useParams } from "react-router-dom";
import { ReactElement, StrictMode, useEffect, useState } from 'react';

import './index.css';

function Belts(): ReactElement {
  const [belts, setBelts] = useState([]);

  useEffect(() => {
    fetch('/api/belts').then(res => res.json().then(json => setBelts(json.belts)));
  }, []);

  return <>
    <div>
      {belts.length === 0 ? 'No belts' : <ul>
          {belts.map(belt => <li key={belt['id']}>{belt['name']}</li>)}
      </ul>}
    </div>
  </>;
}

function ClassLevels(): ReactElement {
  const [classLevels, setClassLevels] = useState([]);

  useEffect(() => {
    fetch('/api/class-levels')
    .then(res => res.json().then(json => setClassLevels(json.class_levels)));
  }, []);

  return <>
    <div>
      {classLevels.length === 0 ? 'No class levels' : <ul>
        {classLevels.map(classLevel =>
          <li key={classLevel['id']}>
            <Link to={`${classLevel['id']}`}>
              {classLevel['prefix']}
            </Link>
          </li>
        )}
      </ul>}
    </div>
  </>;
}

function ClassLevel(): ReactElement {
  const { class_level_id } = useParams();

  const [classLevel, setClassLevel] = useState(null);
  const [schoolClasses, setSchoolClasses] = useState([]);

  useEffect(() => {
    fetch(`/api/class-levels/${class_level_id}/school-classes`)
    .then(res => res.json().then(json => {
      setClassLevel(json['class_level']);
      setSchoolClasses(json['school_classes']);
    }));
  }, [class_level_id]);

  return <>
    {classLevel === null ? '?' : classLevel['prefix']}
    {schoolClasses.length === 0 ? 'No school class' : <ul>
        {schoolClasses.map(schoolClass =>
          <li key={schoolClass['id']}>
            <Link to={`/school-classes/${schoolClass['id']}`}>
              {schoolClass['suffix']}
            </Link>
          </li>
        )}
    </ul>}
  </>;
}

function SchoolClass(): ReactElement {
  const { school_class_id } = useParams();

  const [classLevel, setClassLevel] = useState(null);
  const [schoolClass, setSchoolClass] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch(`/api/school-classes/${school_class_id}`)
    .then(res => res.json().then(json => {
      setClassLevel(json['class_level']);
      setSchoolClass(json['school_class']);
      setStudents(json['students']);
    }));
  }, [school_class_id]);

  return <>
    <div>{classLevel === null ? '' : classLevel['prefix']}{schoolClass === null ? '' : schoolClass['suffix']}</div>
    {students.length === 0 ? '?' : <ul>
      {students.map(student =>
        <li key={student['id']}>{student['name']}</li>
      )}
    </ul>}
  </>;
}

function Layout() {
  return <>
    <ul>
        <li><Link to="/belts">Belts</Link></li>
        <li><Link to="/class-levels">Class Levels</Link></li>
    </ul>
    <Outlet />
  </>;
}

function App() {
  return <Routes>
    <Route path="/" element={<Layout />}>
      <Route path="belts" element={<Belts />} />
      <Route path="class-levels">
        <Route index element={<ClassLevels />} />
        <Route path=":class_level_id" element={<ClassLevel />} />
      </Route>
      <Route path="school-classes/:school_class_id" element={<SchoolClass />} />
    </Route>
  </Routes>;
}

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root'),
);
