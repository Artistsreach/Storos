import React from 'react';

const ToolItem = ({ name, logo }) => {
  const largerLogos = ['Mailchimp API', 'Alpaca API', 'SEMrush API', 'ElevenLabs', 'Spline', 'Scrapy', 'Plaid API', 'Figma API'];
  const isLarger = largerLogos.includes(name);
  const sizeClass = isLarger ? 'w-12 h-8' : 'w-6 h-6';

  return (
    <div className="flex items-center bg-gray-100 p-2 rounded-lg">
      {logo && (
        <div className={`${sizeClass} mr-2 flex items-center justify-center`}>
          <img src={logo} alt={name} className="max-w-full max-h-full object-contain" />
        </div>
      )}
      <span>{name}</span>
    </div>
  );
};

const AutomationWorkflowPage = ({ file }) => {
  if (!file || !file.workflow) {
    return <div className="p-8 text-black">No workflow data available.</div>;
  }

  const { name, category, workflow, tools, trigger } = file;

  return (
    <div className="p-6 bg-white text-black font-sans rounded-lg h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{category}</span>
          <h1 className="text-4xl font-bold mt-2">{name}</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">Workflow</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {workflow.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">Tools</h2>
          <div className="flex flex-wrap gap-4">
            {tools.map((tool, index) => (
              <ToolItem key={index} name={tool.name} logo={tool.logo} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">Trigger</h2>
          <p className="text-gray-700">{trigger}</p>
        </div>
      </div>
    </div>
  );
};

export default AutomationWorkflowPage;
