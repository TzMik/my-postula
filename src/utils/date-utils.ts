export const formatApplicationDate = (date: string): string => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};
