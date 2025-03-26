import Dashboard from "@/components/dashboard";
import { ProjectProvider } from "@/contexts/project-context";


export default function Home() {
  return (
    <ProjectProvider>
      <Dashboard></Dashboard>
    </ProjectProvider>
  );
}
