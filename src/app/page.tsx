"use client";

import { CopilotKitCSSProperties, CopilotChat, CopilotPopup } from "@copilotkit/react-ui";
import { Button } from "@/components/ui/button"
import AppChatHeader, { PopupHeader } from "@/components/canvas/AppChatHeader";
import { X } from "lucide-react"
import CardRenderer from "@/components/canvas/CardRenderer";
import ShikiHighlighter from "react-shiki/web";
import { motion } from "motion/react";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import ItemHeader from "@/components/canvas/ItemHeader";
import NewItemMenu from "@/components/canvas/NewItemMenu";

// Import our custom hooks and components
import { useCanvasState, useItemCreation, useGoogleSheets, useCanvasUI } from "@/hooks/canvas";
import { HITLActions } from "@/components/canvas/HITLActions";
import { AIInstructions } from "@/components/canvas/AIInstructions";
import { CopilotActions } from "@/components/canvas/CopilotActions";

export default function CopilotKitPage() {
  // Use our custom hooks for state management and UI logic
  const { 
    state, 
    setState,
    updateItem, 
    updateItemData, 
    deleteItem, 
    toggleTag, 
    setGlobalTitle, 
    setGlobalDescription 
  } = useCanvasState();
  
  const { 
    addItem,
    hasRecentCreation 
  } = useItemCreation(setState);
  
  const {
    createGoogleSheet,
    listGoogleSheets,
    syncToGoogleSheets
  } = useGoogleSheets(state);
  
  const {
    isDesktop,
    viewState,
    showJsonView,
    setShowJsonView,
    getStatePreviewJSON,
    scrollAreaRef,
    headerOpacity,
    headerDisabled,
    titleInputRef,
    descTextareaRef
  } = useCanvasUI(state);

  console.log("[CoAgent state updated]", state);

  const canvasItems = viewState.items ?? [];
  const showEmptyState = canvasItems.length === 0;

  return (
    <div
      style={
        {
          "--copilot-kit-primary-color": "#3b82f6",
          "--copilot-kit-secondary-color": "#64748b",
          "--copilot-kit-muted-color": "#f1f5f9",
        } as CopilotKitCSSProperties
      }
    >
      {/* AI Components (no visual output) */}
      <HITLActions viewState={viewState} />
      <AIInstructions viewState={viewState} />
      <CopilotActions 
        viewState={viewState}
        updateItem={updateItem}
        updateItemData={updateItemData}
        deleteItem={deleteItem}
        addItem={addItem}
        setGlobalTitle={setGlobalTitle}
        setGlobalDescription={setGlobalDescription}
      />

      <div className="flex h-screen bg-gray-50">
        {/* Desktop Layout */}
        {isDesktop ? (
          <>
            {/* Main Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Canvas Header */}
              <motion.div
                className={cn(
                  "sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 transition-all duration-200",
                  headerDisabled && "pointer-events-none"
                )}
                style={{ opacity: headerOpacity }}
              >
                <div className="max-w-4xl mx-auto space-y-3">
                  <input
                    ref={titleInputRef}
                    type="text"
                    placeholder="Enter canvas title..."
                    value={viewState.globalTitle || ""}
                    onChange={(e) => setGlobalTitle(e.target.value)}
                    className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-400"
                  />
                  <textarea
                    ref={descTextareaRef}
                    placeholder="Add a description..."
                    value={viewState.globalDescription || ""}
                    onChange={(e) => setGlobalDescription(e.target.value)}
                    rows={2}
                    className="w-full text-gray-600 bg-transparent border-none outline-none resize-none placeholder-gray-400"
                  />
                </div>
              </motion.div>

              {/* Canvas Content */}
              <div ref={scrollAreaRef} className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto px-6 py-6">
                  {showEmptyState ? (
                    <EmptyState />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {canvasItems.map((item, index) => (
                        <div key={item.id} className="group">
                          <ItemHeader 
                            item={item}
                            onUpdate={(updates) => updateItem(item.id, updates)}
                            onDelete={() => deleteItem(item.id)}
                          />
                          <CardRenderer
                            item={item}
                            onUpdate={(updates) => updateItem(item.id, updates)}
                            onUpdateData={(updater) => updateItemData(item.id, updater)}
                            onToggleTag={(tag) => toggleTag(item.id, tag)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="border-t bg-white p-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                  <NewItemMenu onCreateItem={(type, name) => addItem(type, name)} />
                  
                  {canvasItems.length > 0 && (
                    <Button
                      variant={showJsonView ? "default" : "outline"}
                      onClick={() => setShowJsonView(!showJsonView)}
                      className="ml-auto"
                    >
                      {showJsonView ? "Canvas View" : "JSON View"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Chat Sidebar */}
            <div className="w-96 border-l bg-white flex flex-col">
              <CopilotChat
                labels={{
                  title: "Assistant",
                  initial: "How can I help you with your canvas?",
                }}
                className="flex-1"
                config={{
                  render: AppChatHeader,
                }}
              />
            </div>
          </>
        ) : (
          /* Mobile Layout */
          <>
            {/* Mobile Canvas */}
            <div className="flex-1 flex flex-col">
              {/* Mobile Header */}
              <div className="bg-white border-b px-4 py-3">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Canvas title..."
                    value={viewState.globalTitle || ""}
                    onChange={(e) => setGlobalTitle(e.target.value)}
                    className="w-full text-lg font-semibold bg-transparent border-none outline-none"
                  />
                  <textarea
                    placeholder="Description..."
                    value={viewState.globalDescription || ""}
                    onChange={(e) => setGlobalDescription(e.target.value)}
                    rows={1}
                    className="w-full text-sm text-gray-600 bg-transparent border-none outline-none resize-none"
                  />
                </div>
              </div>

              {/* Mobile Canvas Content */}
              <div className="flex-1 overflow-auto p-4">
                {showEmptyState ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    {canvasItems.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg shadow-sm border">
                        <ItemHeader 
                          item={item}
                          onUpdate={(updates) => updateItem(item.id, updates)}
                          onDelete={() => deleteItem(item.id)}
                        />
                        <CardRenderer
                          item={item}
                          onUpdate={(updates) => updateItem(item.id, updates)}
                          onUpdateData={(updater) => updateItemData(item.id, updater)}
                          onToggleTag={(tag) => toggleTag(item.id, tag)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Bottom Bar */}
              <div className="border-t bg-white p-4">
                <div className="flex gap-2">
                  <NewItemMenu onCreateItem={(type, name) => addItem(type, name)} />
                  {canvasItems.length > 0 && (
                    <Button
                      variant={showJsonView ? "default" : "outline"}
                      onClick={() => setShowJsonView(!showJsonView)}
                      size="sm"
                    >
                      JSON
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Chat Popup */}
            <CopilotPopup
              labels={{
                title: "Assistant",
                initial: "How can I help you with your canvas?",
              }}
              config={{
                render: PopupHeader,
              }}
            />
          </>
        )}

        {/* JSON View Overlay */}
        {showJsonView && canvasItems.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Canvas JSON State</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowJsonView(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(80vh-80px)]">
                <ShikiHighlighter
                  lang="json"
                  code={JSON.stringify(getStatePreviewJSON(viewState), null, 2)}
                  theme="github-light"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}