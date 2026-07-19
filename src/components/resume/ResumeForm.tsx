"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type ResumeFormProps = {
  onChange: (data: {
    fullName: string;
    email: string;
    phone: string;
    education: string;
    experience: string;
    skills: string;
    projects: string[];
    hobbies: string[];
  }) => void;
};

export default function ResumeForm({ onChange }: ResumeFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([""]);
  const [hobbies, sethobbies] = useState<string[]>([]);

  // Sync all form state to parent whenever any field changes
  useEffect(() => {
    onChange({
      fullName,
      email,
      phone,
      education,
      experience,
      skills: skills.join(", "),
      projects,
      hobbies,
    });
  }, [fullName, email, phone, education, experience, skills, projects, onChange, hobbies]);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();

    if (
      !fullName ||
      !email ||
      !phone ||
      !education ||
      !experience ||
      skills.length === 0 ||
      skills.every((s) => !s.trim()) ||
      projects.length === 0 ||
      projects.every((p) => !p.trim()) ||
      hobbies.length === 0 ||
      hobbies.every((h) => !h.trim())) {
      alert("Please fill in all fields.");
      return;
    }


    alert("Resume Generated!");
  }

  return (
    <form onSubmit={handleGenerate} className="mt-8 max-w-xl space-y-5">
      <div>
        <label className="block font-medium">Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label className="block font-medium">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label className="block font-medium">Phone</label>
        <input
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label className="block font-medium">Education</label>
        <input
          type="text"
          placeholder="Enter your education details"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label className="block font-medium">Experience</label>
        <input
          type="text"
          placeholder="Enter your experience details"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label className="block font-medium">Skills</label>
        <input
          type="text"
          placeholder="Enter your skills (comma separated)"
          value={skills.join(", ")}
          onChange={(e) => {
            const skillsArray = e.target.value
              .split(",")
              .map((skill) => skill.trim());
            setSkills(skillsArray);
          }}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Projects</label>
        {projects.map((proj, index) => (
          <div key={index} className="flex gap-2 items-center mt-2">
            <input
              type="text"
              placeholder={`Enter project #${index + 1} details`}
              value={proj}
              onChange={(e) => {
                const updated = [...projects];
                updated[index] = e.target.value;
                setProjects(updated);
              }}
              className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {projects.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const updated = projects.filter((_, i) => i !== index);
                  setProjects(updated);
                }}
                className="px-3 h-[48px] text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 shrink-0"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setProjects([...projects, ""])}
          className="mt-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 hover:border-indigo-300"
        >
          + Add Project
        </Button>
      </div>
      <div>
        <label className="block font-medium">Hobbies</label>
        <input
          type="text"
          placeholder="Enter your hobbies (comma separated)"
          value={hobbies.join(", ")}
          onChange={(e) => {
            const hobbiesArray = e.target.value
              .split(",")
              .map((hobbie) => hobbie.trim());
            sethobbies(hobbiesArray);
          }}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          className="w-1/2 bg-indigo-600 hover:bg-indigo-700"
        >
          Generate Resume
        </Button>
      </div>
    </form>
  );
}