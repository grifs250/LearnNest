"use client";

import { useState } from "react";

const subjects = [
  "Matemātika", "Ķīmija", "Bioloģija", "Fizika",
  "Angļu valoda", "Krievu valoda", "Franču valoda", "Vācu valoda",
  "Excel", "HTML & CSS", "JavaScript", "Python"
];

interface Props {
  onCreate: (subject: string, description: string, timeslots: string[]) => void;
}

export default function VacancyForm({ onCreate }: Props) {
  const [subject, setSubject] = useState(subjects[0]);
  const [description, setDescription] = useState("");
  const [timeslotInput, setTimeslotInput] = useState("");
  const [timeslots, setTimeslots] = useState<string[]>([]);

  function handleAddTimeslot() {
    if (!timeslotInput) return;
    setTimeslots((prev) => [...prev, timeslotInput]);
    setTimeslotInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate(subject, description, timeslots);
    setDescription("");
    setTimeslotInput("");
    setTimeslots([]);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-4 card bg-base-200 p-4">
      <h3 className="font-bold text-lg mb-2">Izveidot vakanci</h3>
      <div className="form-control">
        <label className="label font-semibold">Priekšmets</label>
        <select
          className="select select-bordered"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="form-control">
        <label className="label font-semibold">Apraksts</label>
        <textarea
          className="textarea textarea-bordered"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label font-semibold">
          Pievienot Laiku (piem. "2023-08-01 10:00")
        </label>
        <div className="flex gap-2">
          <input
            className="input input-bordered"
            value={timeslotInput}
            onChange={(e) => setTimeslotInput(e.target.value)}
          />
          <button type="button" onClick={handleAddTimeslot} className="btn">
            Pievienot
          </button>
        </div>
        <div className="mt-2 space-x-2">
          {timeslots.map((slot, i) => (
            <span key={i} className="badge badge-secondary">{slot}</span>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-primary mt-4">
        Izveidot
      </button>
    </form>
  );
}
