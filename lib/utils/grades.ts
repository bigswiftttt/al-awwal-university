export function calculateGrade(score: number): {
    grade: string;
    gradePoint: number;
} {
    if (score >= 70) return { grade: "A", gradePoint: 5.0 };
    if (score >= 60) return { grade: "B", gradePoint: 4.0 };
    if (score >= 50) return { grade: "C", gradePoint: 3.0 };
    if (score >= 45) return { grade: "D", gradePoint: 2.0 };
    if (score >= 40) return { grade: "E", gradePoint: 1.0 };
    return { grade: "F", gradePoint: 0.0 };
}