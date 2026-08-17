import { supabase } from './client.js';

const ok = async p => { const {data,error}=await p; if(error) throw error; return data };
export const auth = {
  session: async()=> (await supabase.auth.getSession()).data.session,
  signIn:(email,password)=>ok(supabase.auth.signInWithPassword({email,password})),
  signUpStudent:(email,password,display_name,university)=>ok(supabase.auth.signUp({email,password,options:{data:{requested_role:'student',display_name,university}}})),
  signUpHospital:(email,password,display_name,hospital_name)=>ok(supabase.auth.signUp({email,password,options:{data:{requested_role:'hospital',display_name,hospital_name}}})),
  signOut:()=>ok(supabase.auth.signOut()),
  reset:(email,redirectTo)=>ok(supabase.auth.resetPasswordForEmail(email,{redirectTo})),
  updatePassword:(password)=>ok(supabase.auth.updateUser({password}))
};
export const getMyProfile = uid => ok(supabase.from('profiles').select('*').eq('id',uid).single());
export const getStudent = uid => ok(supabase.from('student_profiles').select('*').eq('user_id',uid).single());
export const saveStudent = (uid,patch)=>ok(supabase.from('student_profiles').update(patch).eq('user_id',uid));
export const saveDisplayName=(uid,name)=>ok(supabase.from('profiles').update({display_name:name}).eq('id',uid));
export const listHospitals=()=>ok(supabase.from('hospitals').select('*').eq('status','verified').order('name'));
export const listMyFavorites=uid=>ok(supabase.from('favorites').select('hospital_id').eq('student_id',uid));
export const addFavorite=(uid,hid)=>ok(supabase.from('favorites').insert({student_id:uid,hospital_id:hid}));
export const removeFavorite=(uid,hid)=>ok(supabase.from('favorites').delete().eq('student_id',uid).eq('hospital_id',hid));
export const listStudentScouts=uid=>ok(supabase.from('scouts').select('*, hospitals(name,prefecture,city)').eq('student_id',uid).order('created_at',{ascending:false}));
export const respondScout=(id,status)=>ok(supabase.rpc('respond_to_scout',{p_scout_id:id,p_status:status}));
export const listStudentApplications=uid=>ok(supabase.from('applications').select('*, hospitals(name), job_postings(title)').eq('student_id',uid).order('created_at',{ascending:false}));
export const createApplication=x=>ok(supabase.from('applications').insert(x));
export const withdrawApplication=id=>ok(supabase.rpc('withdraw_application',{p_application_id:id}));
export const submitReport=x=>ok(supabase.from('reports').insert(x));
export const uploadVerification=async(uid,kind,file)=>{const safe=(file.name||'document').replace(/[^a-zA-Z0-9._-]/g,'_');const path=`${uid}/${crypto.randomUUID()}-${safe}`;const {error}=await supabase.storage.from('verification-documents').upload(path,file,{upsert:false});if(error)throw error;return ok(supabase.from('verification_documents').insert({user_id:uid,kind,storage_path:path}))};
export const listMyDocs=uid=>ok(supabase.from('verification_documents').select('*').eq('user_id',uid).order('created_at',{ascending:false}));

export const getHospitalMembership=async uid=>{const rows=await ok(supabase.from('hospital_members').select('*, hospitals(*)').eq('user_id',uid).eq('active',true));return rows?.[0]||null};
export const saveHospital=(id,patch)=>ok(supabase.from('hospitals').update(patch).eq('id',id));
export const searchStudents=(hid,filters={})=>ok(supabase.rpc('search_students',{p_hospital_id:hid,p_graduation_year:filters.graduation_year?Number(filters.graduation_year):null,p_area:filters.area||null,p_specialty:filters.specialty||null,p_university:filters.university||null}));
export const sendScout=(hid,uid,sid,message)=>ok(supabase.from('scouts').insert({hospital_id:hid,student_id:sid,sender_user_id:uid,message}));
export const listHospitalScouts=hid=>ok(supabase.from('scouts').select('*').eq('hospital_id',hid).order('created_at',{ascending:false}));
export const listKnownStudents=hid=>ok(supabase.rpc('hospital_known_students',{p_hospital_id:hid}));
export const listHospitalApps=hid=>ok(supabase.from('applications').select('*, job_postings(title)').eq('hospital_id',hid).order('created_at',{ascending:false}));
export const updateAppStatus=(id,status)=>ok(supabase.rpc('hospital_update_application_status',{p_application_id:id,p_status:status}));
export const listJobs=hid=>ok(supabase.from('job_postings').select('*').eq('hospital_id',hid).order('created_at',{ascending:false}));
export const createJob=x=>ok(supabase.from('job_postings').insert(x));
export const updateJob=(id,patch)=>ok(supabase.from('job_postings').update(patch).eq('id',id));
export const deleteJob=id=>ok(supabase.from('job_postings').delete().eq('id',id));

export const admin = {
  profiles:()=>ok(supabase.from('profiles').select('*').order('created_at',{ascending:false})),
  hospitals:()=>ok(supabase.from('hospitals').select('*').order('created_at',{ascending:false})),
  docs:()=>ok(supabase.from('verification_documents').select('*').order('created_at',{ascending:false})),
  reports:()=>ok(supabase.from('reports').select('*').order('created_at',{ascending:false})),
  audits:()=>ok(supabase.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(200)),
  verifyHospital:(id,approved)=>ok(supabase.rpc('admin_verify_hospital',{p_hospital_id:id,p_approved:approved})),
  setProfileStatus:(id,status)=>ok(supabase.rpc('admin_set_profile_status',{p_user_id:id,p_status:status})),
  reviewDoc:(id,approved,note='')=>ok(supabase.rpc('admin_review_document',{p_document_id:id,p_approved:approved,p_note:note})),
  reportStatus:(id,status)=>ok(supabase.rpc('admin_set_report_status',{p_report_id:id,p_status:status})),
  signedDoc:async path=>{const {data,error}=await supabase.storage.from('verification-documents').createSignedUrl(path,300);if(error)throw error;return data.signedUrl}
};
