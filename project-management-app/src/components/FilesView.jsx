import { FiDownload } from 'react-icons/fi';
import { downloadAttachment } from '../API/AttachmentAPI';

const FilesView = ({ files = [], onFileClick }) => {
  // Determine a representative icon for a file using its MIME type first, then its extension
  const getFileIcon = (file) => {
    if (!file) return '📎';

    const type = (file.type || file.contentType || '').toLowerCase();
    const name = (file.name || '').toLowerCase();

    // --- Detect by MIME type -------------------------------------
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type === 'application/pdf') return '📄';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('presentation') || type.includes('powerpoint')) return '📈';
    if (type.includes('word') || type.includes('document')) return '📝';

    // --- Fallback: detect by file extension ----------------------
    const ext = name.split('.').pop();
    switch (ext) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return '🖼️';
      case 'mp4':
      case 'mov':
      case 'avi':
        return '🎥';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'pdf':
        return '📄';
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📈';
      case 'doc':
      case 'docx':
      case 'txt':
        return '📝';
      default:
        return '📎';
    }
  };

  const handleFileClick = async (file) => {
    try {
      if (typeof onFileClick === 'function') {
        // Allow parent to override behaviour if desired
        return onFileClick(file);
      }

      // Default behaviour: download via backend
      const blob = await downloadAttachment(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || 'attachment';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download attachment:', err);
      alert('Failed to download attachment.');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">All Files</h2>
        <div className="text-sm text-gray-500">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
          <p className="text-gray-500">Files attached to tasks will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleFileClick(file)}
            >
              <div className="text-3xl">{getFileIcon(file)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{file.name}</div>
                <div className="text-sm text-gray-500">
                  {file.taskTitle}
                </div>
                {/* <div className="text-xs text-gray-400">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </div> */}
              </div>
              <button
                className="p-2 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileClick(file);
                }}
                aria-label="Download file"
              >
                <FiDownload size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesView; 