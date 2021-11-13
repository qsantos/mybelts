import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Outlet, Route, Routes, useParams } from "react-router-dom";
import { StrictMode, useEffect, useState } from 'react';

import './index.css';

function Belts() {
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

function ClassLevels() {
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

function ClassLevel() {
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

function SchoolClass() {
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

function SchoolClassBelts() {
  const { school_class_id } = useParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/school-classes/${school_class_id}/student-belts`)
    .then(res => res.json().then(json => {
      setData(json);
    }));
  }, [school_class_id]);

  if (data === null) {
    return <>...</>;
  } else {
    const { class_level, school_class, belts, skill_domains, student_belts } = data;
    if (student_belts.length === 0) {
        return <>No student in this class</>;
    }
    const belt_by_id = Object.fromEntries(belts.map(belt => [belt['id'], belt]));

    return <>
      <h3>{class_level['prefix']}{school_class['suffix']}</h3>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            {skill_domains.map(skill_domain => <th>{skill_domain['name']}</th>)}
          </tr>
        </thead>
        <tbody>
          {student_belts.map(({student, belts}) => {
            const belt_id_by_skill_domain_id = Object.fromEntries(belts.map(([skill_domain_id, belt_id]) => [skill_domain_id, belt_id]));
            return <tr>
              <th>{student['name']}</th>
              {skill_domains.map(skill_domain => {
                const belt_id = belt_id_by_skill_domain_id[skill_domain['id']];
                if (belt_id === undefined) {
                  return <td>-</td>;
                }
                const belt = belt_by_id[belt_id];
                return <td>{belt['name']}</td>;
              })}
            </tr>;
          })}
        </tbody>
      </table>
    </>;
  }
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
      <Route path="school-classes/:school_class_id">
        <Route index element={<SchoolClass />} />
        <Route path="belts" element={<SchoolClassBelts />} />
      </Route>
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
