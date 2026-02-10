import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalLoader from "./GlobalLoader";

/**
 * Loader test page : /loader
 * Once the loader is complete, redirect to the home page.
 */
const LoaderTestPage = () => {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  return (
    <>
      <GlobalLoader
        onComplete={() => {
          setDone(true);
          sessionStorage.setItem("fromLoader", "true");
          setTimeout(() => navigate("/", { replace: true }), 300);
        }}
        loadDurationMs={2500}
      />
      {done && (
        <div style={{ display: "none" }}>
          Loader terminé, redirection…
        </div>
      )}
    </>
  );
};

export default LoaderTestPage;
