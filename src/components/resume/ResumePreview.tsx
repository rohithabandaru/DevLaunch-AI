type ResumePreviewProps = {
  fullName: string;
  email: string;
  phone?: string;
  education?: string;
  experience?: string;
  skills?: string;
  projects?: string[];
  hobbies?: string;
};

export default function ResumePreview({
  fullName,
  email,
  phone,
  education,
  experience,
  skills,
  projects,
  hobbies,
}: ResumePreviewProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden animate-fade-in">
      {/* Decorative top accent bar */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="p-8 md:p-10 space-y-8">
        {/* Header Section */}
        <div className="border-b border-slate-100 pb-6 text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {fullName || "Your Name"}
          </h2>
          <div className="mt-3 flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>{email || "your.email@example.com"}</span>
            {phone && (
              <>
                <span className="hidden md:inline text-slate-300">•</span>
                <span>{phone}</span>
              </>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Education
          </h3>
          <div className="border-l-2 border-slate-100 pl-4">
            <p className="text-slate-700 font-medium leading-relaxed">
              {education || "Your Education Details"}
            </p>
          </div>
        </div>

        {/* Experience Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Experience
          </h3>
          <div className="border-l-2 border-slate-100 pl-4">
            <p className="text-slate-700 font-medium leading-relaxed">
              {experience || "Your Experience Details"}
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Skills
          </h3>
          <div className="border-l-2 border-slate-100 pl-4 flex flex-wrap gap-2">
            {skills ? (
              skills.split(",").map((skill, idx) => (
                skill.trim() && (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"
                  >
                    {skill.trim()}
                  </span>
                )
              ))
            ) : (
              <span className="text-slate-400 text-sm">Your Skills Details</span>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Projects
          </h3>
          <div className="border-l-2 border-slate-100 pl-4">
            {projects && projects.length > 0 && !projects.every((p) => !p.trim()) ? (
              <ul className="list-disc pl-4 space-y-2 text-slate-700 text-sm leading-relaxed">
                {projects.map((proj, idx) => (
                  proj.trim() && <li key={idx}>{proj}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm">Your Project Details</p>
            )}
          </div>
        </div>
        {/* Hobbies Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Hobbies
          </h3>
          <div className="border-l-2 border-slate-100 pl-4 flex flex-wrap gap-2">
            {hobbies ? (
              hobbies.split(",").map((hobbie, idx) => (
                hobbie.trim() && (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"
                  >
                    {hobbie.trim()}
                  </span>
                )
              ))
            ) : (
              <span className="text-slate-400 text-sm">Your Hobbies Details</span>
            )}
          </div>
        </div>

      </div>
    </div>
  
  );
}