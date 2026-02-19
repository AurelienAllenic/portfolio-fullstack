import ProjectCategory from "./ProjectCategory";
import { allprojects_cover } from "./Data";

interface AllProjectsSectionProps {
  categoryIndex?: number;
}

const AllProjectsSection = ({ categoryIndex }: AllProjectsSectionProps) => {
  return (
    <ProjectCategory
      cover={allprojects_cover}
      categoryIndex={categoryIndex}
    />
  );
};

export default AllProjectsSection;
