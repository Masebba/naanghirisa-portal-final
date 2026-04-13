export async function summarizeImpact(programData: string) {
  try {
    const parsed = JSON.parse(programData);
    const programs = Array.isArray(parsed) ? parsed : [];

    if (programs.length === 0) {
      return 'No programs have been added yet. Once activities are created, this section will generate a concise operational summary.';
    }

    const names = programs
      .slice(0, 3)
      .map((program: any) => program?.name)
      .filter(Boolean)
      .join(', ');

    const running = programs.filter((program: any) => program?.status === 'Running').length;
    const planned = programs.filter((program: any) => program?.status === 'Planned').length;
    const completed = programs.filter((program: any) => program?.status === 'Completed').length;

    return `Programs tracked: ${names}. Active initiatives: ${running}. Planned initiatives: ${planned}. Completed initiatives: ${completed}. Focus on consistent delivery, transparent reporting, and measurable child and community outcomes.`;
  } catch {
    return 'A concise summary could not be generated from the provided data.';
  }
}
