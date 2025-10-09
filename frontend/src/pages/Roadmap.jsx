import { useEffect, useState } from "react";
import roadmapData from "../data/roadmap.json";

export default function Roadmap() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    console.log("Roadmap data:", roadmapData); // <— Ajoute ça
    if (roadmapData?.sections) setSections(roadmapData.sections);
  }, []);

  const statusColors = {
    done: "bg-green-500 text-white",
    "in-progress": "bg-yellow-500 text-white",
    planned: "bg-blue-500 text-white",
    backlog: "bg-gray-400 text-white"
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Multi-Cloud Manager Roadmap
        </h2>
        <span className="text-sm text-gray-500">
          v{roadmapData.version} • Last updated {roadmapData.lastUpdate}
        </span>
      </div>

      <div className="relative border-l border-gray-300">
        {Array.isArray(sections) && sections.map((section, idx) => (
          <div key={idx} className="mb-8 ml-6">
            {/* Timeline dot */}
            <div
              className={`absolute w-3 h-3 rounded-full -left-1.5 border border-white ${statusColors[section.status]}`}
            ></div>

            {/* Phase header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {section.phase}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[section.status]}`}
              >
                {section.status.replace("-", " ")}
              </span>
            </div>

            {/* Description */}
            <p className="mt-1 text-gray-600 text-sm">{section.description}</p>

            {/* Tasks list */}
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
              {section.tasks.map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
