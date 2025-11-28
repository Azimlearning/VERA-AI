"use client";

import UnifiedAppLayout from "../../components/layout/UnifiedAppLayout";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaChartLine, 
  FaUsers, 
  FaPodcast, 
  FaFileAlt, 
  FaImages,
  FaQuestionCircle,
  FaSearch
} from "react-icons/fa";

const AGENTS = [
  {
    id: "analytics",
    name: "Analytics Agent",
    description: "Data insights & forecasting",
    icon: FaChartLine,
  },
  {
    id: "podcast",
    name: "Podcast Agent",
    description: "Script & audio generation",
    icon: FaPodcast,
  },
  {
    id: "meetings",
    name: "Meetings Agent",
    description: "Meeting analysis & action items",
    icon: FaUsers,
  },
  {
    id: "content",
    name: "Content Agent",
    description: "Content & image generation",
    icon: FaFileAlt,
  },
  {
    id: "quiz",
    name: "Quiz Agent",
    description: "Interactive knowledge testing",
    icon: FaQuestionCircle,
  },
  {
    id: "visual",
    name: "Visual Agent",
    description: "Image recognition & analysis",
    icon: FaImages,
  },
];

export default function AgentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredAgents = AGENTS.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLaunchAgent = (agentId) => {
    router.push(`/vera?agent=${agentId}`);
  };

  const handleNewChat = () => {
    router.push('/vera');
  };

  const handleLoadSession = () => {
    router.push('/vera');
  };

  return (
    <UnifiedAppLayout
      onNewChat={handleNewChat}
      onLoadSession={handleLoadSession}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header with Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Agents</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl">
                Supercharge your workflow with specialized AI assistants designed to accelerate your work.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search for an agent..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => {
            const IconComponent = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                <p className="text-gray-600 mb-4">{agent.description}</p>
                
                <div className="space-y-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchAgent(agent.id);
                    }}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-all text-sm"
                  >
                    Start Chat
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/agents/${agent.id}`);
                    }}
                    className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-teal-500 transition-all text-sm"
                  >
                    Try Agent
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </UnifiedAppLayout>
  );
}
