import { load_project_by_id } from "@/app/projects.controller";
import ProjectView from "@/components/project-view";
import { ProjectProvider } from "@/contexts/project-context";
import { notFound } from "next/navigation";

interface ProjectDetailsProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetails({ params }: ProjectDetailsProps) {
    const project = await load_project_by_id((await params).id)
    if (!project) return notFound()

    return (
        <ProjectProvider>
            <ProjectView projectId={project.id}></ProjectView>
        </ProjectProvider>
    )
}