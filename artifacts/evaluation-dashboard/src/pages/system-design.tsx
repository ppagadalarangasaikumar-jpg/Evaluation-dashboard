export default function SystemDesign() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Design Docs</h1>
        <p className="text-muted-foreground mt-2">Architecture documentation for the Campus Notification System.</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Stage 1: REST API Design</h2>
          <p className="text-sm text-muted-foreground mt-2">Endpoints for managing student notifications</p>
          <pre className="mt-4 bg-muted/50 p-4 rounded-md text-sm font-mono text-muted-foreground overflow-x-auto">
{`GET    /api/students/{studentId}/notifications
GET    /api/notifications/unread
POST   /api/notifications
PATCH  /api/notifications/{id}/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/{id}
GET    /api/notifications/stream (SSE)`}
          </pre>
        </div>

        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Stage 2: PostgreSQL Schema</h2>
          <p className="text-sm text-muted-foreground mt-2">Core tables and indexing strategy</p>
          <pre className="mt-4 bg-muted/50 p-4 rounded-md text-sm font-mono text-muted-foreground overflow-x-auto">
{`CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE student_notifications (
  notification_id UUID REFERENCES notifications(id),
  student_id INT REFERENCES students(id),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  PRIMARY KEY (notification_id, student_id)
);

CREATE INDEX idx_student_unread ON student_notifications(student_id) WHERE is_read = FALSE;`}
          </pre>
        </div>

        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Stage 3: Query Optimization</h2>
          <p className="text-sm text-muted-foreground mt-2">Improving read query performance</p>
          <pre className="mt-4 bg-muted/50 p-4 rounded-md text-sm font-mono text-muted-foreground overflow-x-auto">
{`-- Bad Query (Full table scan)
SELECT * FROM notifications n 
JOIN student_notifications sn ON n.id = sn.notification_id 
WHERE sn.student_id = 123 AND sn.is_read = FALSE;

-- Optimized Query (Leveraging composite index)
CREATE INDEX idx_student_read_status ON student_notifications(student_id, is_read);
-- Database now uses index-only scan for the lookup before joining`}
          </pre>
        </div>

        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Stage 4: Scaling Strategies</h2>
          <p className="text-sm text-muted-foreground mt-2">Handling large volumes of notifications</p>
          <ul className="list-disc pl-5 mt-4 space-y-2 text-sm text-muted-foreground">
            <li><strong>Pagination:</strong> Cursor-based pagination (created_at, id) over OFFSET/LIMIT</li>
            <li><strong>Caching:</strong> Redis cache for unread counts (Hash: student_id -&#62; count)</li>
            <li><strong>Real-time:</strong> Server-Sent Events (SSE) instead of long-polling</li>
            <li><strong>Database:</strong> Read replicas for GET requests, Partitioning student_notifications by date</li>
          </ul>
        </div>

        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Stage 5: Reliable Bulk Sending</h2>
          <p className="text-sm text-muted-foreground mt-2">Ensuring delivery without duplicates</p>
          <pre className="mt-4 bg-muted/50 p-4 rounded-md text-sm font-mono text-muted-foreground overflow-x-auto">
{`// Problem: Sequential inserts are slow, failing mid-way requires complex recovery
// Solution: Idempotency keys & background workers

async function processBulkJob(jobId, payload) {
  // 1. Check idempotency (Redis)
  if (await isProcessed(jobId)) return;
  
  // 2. Batch insert (Postgres COPY or multi-value INSERT)
  await db.query(\`
    INSERT INTO student_notifications (notification_id, student_id)
    VALUES ...
  \`);
  
  // 3. Mark processed
  await markProcessed(jobId);
}`}
          </pre>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold">Stage 6: Priority Inbox</h2>
          <p className="text-sm text-muted-foreground mt-2">Ranking notifications by importance</p>
          <pre className="mt-4 bg-muted/50 p-4 rounded-md text-sm font-mono text-muted-foreground overflow-x-auto">
{`// Ranking weights: Placement = 3, Result = 2, Event = 1
// Data Structure: Min-Heap of size 10 to keep top 10 highest priority

class PriorityInbox {
  heap = new MinHeap(10); // ordered by priority DESC, then created_at DESC
  
  add(notification) {
    if (this.heap.size() < 10) {
      this.heap.push(notification);
    } else if (notification.priority > this.heap.peek().priority) {
      this.heap.pop();
      this.heap.push(notification);
    }
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
