import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Outlet, Route, Routes, useParams } from "react-router-dom";
import { StrictMode, useEffect, useState } from 'react';

import Breadcrumb from 'react-bootstrap/Breadcrumb';
import ListGroup from 'react-bootstrap/ListGroup';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';

function BreadcrumbItem({ children, href, active }: { children: any, href?: string, active?: boolean }) {
  if (href) {
    return <Breadcrumb.Item linkAs={Link} linkProps={{to: href}}>{children}</Breadcrumb.Item>
  } else {
    return <Breadcrumb.Item active={active === undefined ? false : active}>{children}</Breadcrumb.Item>
  }
}

function Loader() {
    return <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading</span>
    </Spinner>;
}

function Belts() {
  const [belts, setBelts] = useState([]);

  useEffect(() => {
    fetch('/api/belts').then(res => res.json().then(json => setBelts(json.belts)));
  }, []);

  if (belts.length === 0) {
    return <>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem active href="/belts">Belts</BreadcrumbItem>
        </Breadcrumb>
        <Loader />
      </>;
  }

  return <>
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem active href="/belts">Belts</BreadcrumbItem>
    </Breadcrumb>
    <ListGroup>
      {belts.map(belt => <ListGroup.Item key={belt['id']}>{belt['name']}</ListGroup.Item>)}
    </ListGroup>
  </>;
}

function ClassLevels() {
  const [classLevels, setClassLevels] = useState([]);

  useEffect(() => {
    fetch('/api/class-levels')
    .then(res => res.json().then(json => setClassLevels(json.class_levels)));
  }, []);

  if (classLevels.length === 0) {
    return <>
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem active href="/class-levels">Levels</BreadcrumbItem>
      </Breadcrumb>
      <Loader />
    </>;
  }

  return <ListGroup>
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem active href="/class-levels">Levels</BreadcrumbItem>
    </Breadcrumb>
    {classLevels.map(classLevel =>
      <ListGroup.Item action key={classLevel['id']}>
        <Nav.Link as={Link} to={`${classLevel['id']}`}>
          {classLevel['prefix']}
        </Nav.Link>
      </ListGroup.Item>
    )}
  </ListGroup>;
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

  if (classLevel === null) {
    return <>
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
        <BreadcrumbItem active href={`/class-levels/${class_level_id}`}>Level ?</BreadcrumbItem>
      </Breadcrumb>
      <Loader />
    </>;
  }

  return <>
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
      <BreadcrumbItem active href={`/class-levels/${classLevel['id']}`}>Level {classLevel['prefix']}</BreadcrumbItem>
    </Breadcrumb>
    <h3>{classLevel['prefix']}</h3>
    {schoolClasses.length === 0 ? 'No school class' : <ListGroup>
        {schoolClasses.map(schoolClass =>
          <ListGroup.Item action key={schoolClass['id']}>
            <Nav.Link as={Link} to={`/school-classes/${schoolClass['id']}`}>
              {schoolClass['suffix']}
            </Nav.Link>
          </ListGroup.Item>
        )}
    </ListGroup>}
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

  if (classLevel === null || schoolClass === null) {
    return <>
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
        <BreadcrumbItem>Level ?</BreadcrumbItem>
        <BreadcrumbItem active href="/">Class ?</BreadcrumbItem>
      </Breadcrumb>
      <Loader />
    </>;
  }

  return <>
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
      <BreadcrumbItem href={`/class-levels/${classLevel['id']}`}>Level {classLevel['prefix']}</BreadcrumbItem>
      <BreadcrumbItem active href={`/school-classes/${schoolClass['id']}`}>Class {schoolClass['suffix']}</BreadcrumbItem>
    </Breadcrumb>
    <h3>{classLevel['prefix']}{schoolClass['suffix']}</h3>
    {students.length === 0 ? 'No students' : <ListGroup>
      {students.map(student =>
        <ListGroup.Item action key={student['id']}>{student['name']}</ListGroup.Item>
      )}
    </ListGroup>}
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
    return <>
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
        <BreadcrumbItem>Level ?</BreadcrumbItem>
        <BreadcrumbItem href={`/school-class/${school_class_id}`}>Class ?</BreadcrumbItem>
        <BreadcrumbItem active href={`/school-classes/${school_class_id}/belts`}>Belts</BreadcrumbItem>
      </Breadcrumb>
      <Loader />
    </>;
  }

  const { class_level, school_class, belts, skill_domains, student_belts } = data;
  if (student_belts.length === 0) {
      return <>No student in this class</>;
  }
  const belt_by_id = Object.fromEntries(belts.map(belt => [belt['id'], belt]));

  return <>
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
      <BreadcrumbItem href={`/class-levels/${class_level['id']}`}>Level {class_level['prefix']}</BreadcrumbItem>
      <BreadcrumbItem active href={`/school-classes/${school_class['id']}`}>Class {school_class['suffix']}</BreadcrumbItem>
        <BreadcrumbItem active href={`/school-classes/${school_class['id']}/belts`}>Belts</BreadcrumbItem>
    </Breadcrumb>
    <h3>{class_level['prefix']}{school_class['suffix']}</h3>
    <Table>
      <thead>
        <tr>
          <th>Student</th>
          {skill_domains.map(skill_domain => <th key={skill_domain['id']}>{skill_domain['name']}</th>)}
        </tr>
      </thead>
      <tbody>
        {student_belts.map(({student, belts}) => {
          const belt_id_by_skill_domain_id = Object.fromEntries(belts.map(([skill_domain_id, belt_id]) => [skill_domain_id, belt_id]));
          return <tr key={student['id']}>
            <th>{student['name']}</th>
            {skill_domains.map(skill_domain => {
              const belt_id = belt_id_by_skill_domain_id[skill_domain['id']];
              if (belt_id === undefined) {
                return <td key={skill_domain['id']}>-</td>;
              }
              const belt = belt_by_id[belt_id];
              return <td key={skill_domain['id']}>{belt['name']}</td>;
            })}
          </tr>;
        })}
      </tbody>
    </Table>
  </>;
}

function Layout() {
  return <>
    <Navbar>
      <Navbar.Brand as={Link} to="/">Skills</Navbar.Brand>
      <Nav>
          <Nav.Item><Nav.Link as={Link} to="/">Home</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link as={Link} to="/belts">Belts</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link as={Link} to="/class-levels">Class Levels</Nav.Link></Nav.Item>
      </Nav>
    </Navbar>
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
