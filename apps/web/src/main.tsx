import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { TaskDto, TaskPriority, TaskStatus } from "@foundry/contracts";
import "@foundry/design-tokens/tokens.css";
import "./styles.css";
import { api, token } from "./api";

type Mode="login"|"register";
const nextStatus:Record<TaskStatus,TaskStatus>={pending:"in_progress",in_progress:"done",done:"pending"};

function Auth({onLogin}:{onLogin:()=>void}){
  const [mode,setMode]=useState<Mode>("login"),[email,setEmail]=useState("demo@example.com"),[password,setPassword]=useState("password123"),[message,setMessage]=useState(""),[verify,setVerify]=useState("");
  async function submit(e:React.FormEvent){e.preventDefault();setMessage("");try{
    if(mode==="register"){const r=await api.register(email,password);setVerify(r.verificationToken||"");setMessage("Account created. Verify it before login.");}
    else {const r=await api.login(email,password);localStorage.setItem("foundry_session",r.sessionToken);onLogin();}
  }catch(err:any){setMessage(err.message)}}
  async function verifyNow(){try{await api.verify(verify);setMode("login");setMessage("Verified. Sign in now.");}catch(err:any){setMessage(err.message)}}
  return <div className="authShell"><section className="authCard"><span className="eyebrow">VIBE SAAS FOUNDRY</span><h1>Ship from a working system.</h1><p className="muted">A reference SaaS built to be transformed safely by humans and coding agents.</p><div className="tabs"><button className={mode==="login"?"active":""} onClick={()=>setMode("login")}>Sign in</button><button className={mode==="register"?"active":""} onClick={()=>setMode("register")}>Create account</button></div><form onSubmit={submit}><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={8} required/></label><button className="primary" type="submit">{mode==="login"?"Enter workspace":"Create account"}</button></form>{verify&&<div className="verify"><input value={verify} onChange={e=>setVerify(e.target.value)}/><button onClick={verifyNow}>Verify development token</button></div>}{message&&<p className="notice">{message}</p>}</section></div>
}

function App(){
  const [logged,setLogged]=useState(Boolean(token())),[tasks,setTasks]=useState<TaskDto[]>([]),[error,setError]=useState(""),[title,setTitle]=useState(""),[priority,setPriority]=useState<TaskPriority>("medium");
  const params=useMemo(()=>new URLSearchParams(location.search),[location.search]);
  const [search,setSearch]=useState(params.get("search")||""),[status,setStatus]=useState(params.get("status")||""),[sort,setSort]=useState(params.get("sort")||"created");
  const query=()=>{const p=new URLSearchParams();if(search)p.set("search",search);if(status)p.set("status",status);if(sort)p.set("sort",sort);return p.toString()?`?${p}`:""};
  async function load(){if(!logged)return;try{setError("");setTasks(await api.tasks(query()));}catch(e:any){setError(e.message);if(/session|token|unauthorized/i.test(e.message)){localStorage.removeItem("foundry_session");setLogged(false)}}}
  useEffect(()=>{const p=new URLSearchParams();if(search)p.set("search",search);if(status)p.set("status",status);if(sort)p.set("sort",sort);history.replaceState(null,"",`${location.pathname}${p.toString()?`?${p}`:""}`);const t=setTimeout(load,180);return()=>clearTimeout(t)},[search,status,sort,logged]);
  if(!logged)return <Auth onLogin={()=>setLogged(true)}/>;

  async function add(e:React.FormEvent){e.preventDefault();if(!title.trim())return;const optimistic:TaskDto={id:`temp-${Date.now()}`,title,description:null,status:"pending",priority,dueDate:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};setTasks(v=>[optimistic,...v]);setTitle("");try{const real=await api.createTask({title:optimistic.title,priority});setTasks(v=>v.map(x=>x.id===optimistic.id?real:x));}catch(e:any){setTasks(v=>v.filter(x=>x.id!==optimistic.id));setError(e.message)}}
  async function cycle(task:TaskDto){const before=task;const changed={...task,status:nextStatus[task.status]};setTasks(v=>v.map(x=>x.id===task.id?changed:x));try{const real=await api.updateTask(task.id,{status:changed.status});setTasks(v=>v.map(x=>x.id===task.id?real:x));}catch(e:any){setTasks(v=>v.map(x=>x.id===task.id?before:x));setError(e.message)}}
  async function remove(task:TaskDto){const snapshot=tasks;setTasks(v=>v.filter(x=>x.id!==task.id));try{await api.deleteTask(task.id)}catch(e:any){setTasks(snapshot);setError(e.message)}}
  async function signOut(all=false){try{all?await api.logoutAll():await api.logout()}finally{localStorage.removeItem("foundry_session");setLogged(false)}}
  return <div className="appShell"><aside><div><span className="eyebrow">FOUNDRY</span><h2>Reference OS</h2></div><nav><button className="navActive">Tasks</button><button onClick={()=>signOut(true)}>Log out everywhere</button><button onClick={()=>signOut()}>Sign out</button></nav></aside><main><header><div><span className="eyebrow">WORKSPACE</span><h1>Tasks</h1><p className="muted">Filters persist in the URL. Status changes are optimistic and roll back on failure.</p></div><div className="stat"><b>{tasks.length}</b><span>visible tasks</span></div></header><section className="filters"><input placeholder="Search tasks" value={search} onChange={e=>setSearch(e.target.value)}/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="done">Done</option></select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="created">Newest</option><option value="due">Due date</option><option value="priority">Priority</option><option value="title">Title</option></select></section><form className="composer" onSubmit={add}><input placeholder="Add a task…" value={title} onChange={e=>setTitle(e.target.value)}/><select value={priority} onChange={e=>setPriority(e.target.value as TaskPriority)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><button className="primary">Add task</button></form>{error&&<div className="error">{error}</div>}<section className="taskList">{tasks.map(task=><article className="task" key={task.id}><button className={`status ${task.status}`} onClick={()=>cycle(task)} aria-label="Cycle status">{task.status.replace("_"," ")}</button><div className="taskText"><h3>{task.title}</h3><p>{task.dueDate?`Due ${new Date(task.dueDate).toLocaleDateString()}`:"No due date"}</p></div><span className={`priority ${task.priority}`}>{task.priority}</span><button className="ghost" onClick={()=>remove(task)}>Delete</button></article>)}{!tasks.length&&<div className="empty">No tasks match this view.</div>}</section></main></div>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
