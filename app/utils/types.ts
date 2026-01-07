export interface Experience {
  job_title: string
  company: string
  from_month: string
  from_year: string
  to_month: string
  to_year: string
  job_location: string
  responsibilities: string
}

export interface Education {
  degree : string,
  institution_name : string,
  year: number
}

export interface Project {
  project_title: string,
  project_description: string,
  tech_stack: string,
  link: string,
}