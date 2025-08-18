import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

export type Student = {
  student_id: string;
  first_name: string;
  last_name: string;
  grade_level?: string | null;
  status?: "active" | "inactive" | "graduated";
  parent_name?: string | null;
};

interface StudentListProps {
  schoolId: string;
}

export default function StudentList({ schoolId }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [sortKey, setSortKey] = useState<keyof Student>("last_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("students")
        .select("student_id, first_name, last_name, grade_level, status, parent_name")
        .eq("school_id", schoolId);
      if (!error && data) setStudents(data);
      setLoading(false);
    }
    if (schoolId) fetchStudents();
  }, [schoolId]);

  const sortedStudents = [...students].sort((a, b) => {
    const aVal = a[sortKey] || "";
    const bVal = b[sortKey] || "";
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Student) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Student List</h2>
      {loading ? (
        <p>Loading students...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort("student_id")}>ID</th>
                <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort("last_name")}>Name</th>
                <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort("grade_level")}>Grade</th>
                <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort("status")}>Status</th>
                <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort("parent_name")}>Parent</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr key={student.student_id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm">{student.student_id}</td>
                  <td className="px-3 py-2 text-sm">{student.last_name}, {student.first_name}</td>
                  <td className="px-3 py-2 text-sm">{student.grade_level || "-"}</td>
                  <td className="px-3 py-2 text-sm">{student.status || "-"}</td>
                  <td className="px-3 py-2 text-sm">{student.parent_name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
