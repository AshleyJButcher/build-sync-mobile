import {
  Product,
  Milestone,
  Decision,
  CostChange,
  Project,
  PaintColor,
} from '../hooks/useProjectData';
import { Project as ProjectType } from '../hooks/useProjects';
import { ChatMessage } from '../hooks/useChatMessages';

// Mock Projects
export const mockProjects: ProjectType[] = [
  {
    id: 'mock-project-1',
    name: 'Riverside Modern Home',
    description: 'A beautiful modern home renovation project',
    address: '123 Riverside Drive, London, SW1A 1AA',
    status: 'active',
    budget: 500000,
    start_date: '2024-01-15',
    end_date: '2024-12-31',
    created_by: 'mock-user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'mock-project-2',
    name: 'City Center Apartment',
    description: 'Luxury apartment renovation in the heart of the city',
    address: '456 High Street, Manchester, M1 1AA',
    status: 'active',
    budget: 250000,
    start_date: '2024-02-01',
    end_date: null,
    created_by: 'mock-user-1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    archived_at: null,
  },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'mock-product-1',
    project_id: 'mock-project-1',
    name: 'Italian Marble Countertop',
    category: 'Kitchen',
    description: 'Premium Italian marble countertop for kitchen island',
    image_url: null,
    price: 3500,
    status: 'pending',
    added_by: 'mock-user-1',
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'mock-product-2',
    project_id: 'mock-project-1',
    name: 'Smart LED Lighting System',
    category: 'Lighting',
    description: 'Full home smart lighting system with app control',
    image_url: null,
    price: 2800,
    status: 'approved',
    added_by: 'mock-user-2',
    created_at: '2024-01-12T00:00:00Z',
  },
  {
    id: 'mock-product-3',
    project_id: 'mock-project-1',
    name: 'Hardwood Flooring',
    category: 'Flooring',
    description: 'Premium oak hardwood flooring for living areas',
    image_url: null,
    price: 4500,
    status: 'pending',
    added_by: 'mock-user-1',
    created_at: '2024-01-14T00:00:00Z',
  },
  {
    id: 'mock-product-4',
    project_id: 'mock-project-1',
    name: 'Designer Bathroom Suite',
    category: 'Bathroom',
    description: 'Complete bathroom suite with freestanding bathtub',
    image_url: null,
    price: 5200,
    status: 'approved',
    added_by: 'mock-user-2',
    created_at: '2024-01-16T00:00:00Z',
  },
  {
    id: 'mock-product-5',
    project_id: 'mock-project-2',
    name: 'Energy Efficient Windows',
    category: 'Windows',
    description: 'Double-glazed energy efficient windows',
    image_url: null,
    price: 3200,
    status: 'pending',
    added_by: 'mock-user-1',
    created_at: '2024-02-05T00:00:00Z',
  },
];

// Mock Milestones
export const mockMilestones: Milestone[] = [
  {
    id: 'mock-milestone-1',
    project_id: 'mock-project-1',
    title: 'Foundation Complete',
    description: 'Concrete foundation poured and cured',
    due_date: '2024-02-15',
    status: 'completed',
    sort_order: 0,
    completion_percentage: 100,
    created_at: '2024-01-05T00:00:00Z',
  },
  {
    id: 'mock-milestone-2',
    project_id: 'mock-project-1',
    title: 'Framing Complete',
    description: 'All structural framing completed',
    due_date: '2024-03-30',
    status: 'in-progress',
    sort_order: 1,
    completion_percentage: 65,
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'mock-milestone-3',
    project_id: 'mock-project-1',
    title: 'Plumbing & Electrical',
    description: 'All plumbing and electrical work completed',
    due_date: '2024-05-15',
    status: 'upcoming',
    sort_order: 2,
    completion_percentage: 0,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'mock-milestone-4',
    project_id: 'mock-project-1',
    title: 'Interior Finishing',
    description: 'Painting, flooring, and final touches',
    due_date: '2024-08-30',
    status: 'upcoming',
    sort_order: 3,
    completion_percentage: 0,
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'mock-milestone-5',
    project_id: 'mock-project-2',
    title: 'Demolition Complete',
    description: 'All existing fixtures and fittings removed',
    due_date: '2024-02-20',
    status: 'completed',
    sort_order: 0,
    completion_percentage: 100,
    created_at: '2024-02-01T00:00:00Z',
  },
];

// Mock Decisions
export const mockDecisions: Decision[] = [
  {
    id: 'mock-decision-1',
    project_id: 'mock-project-1',
    title: 'Kitchen Layout Approval',
    description: 'Client needs to approve the final kitchen layout design',
    category: 'Design',
    status: 'pending',
    due_date: '2024-02-28',
    requested_by: 'mock-user-2',
    created_at: '2024-01-18T00:00:00Z',
  },
  {
    id: 'mock-decision-2',
    project_id: 'mock-project-1',
    title: 'Bathroom Tile Selection',
    description: 'Choose between ceramic or porcelain tiles for bathroom',
    category: 'Materials',
    status: 'approved',
    due_date: '2024-02-10',
    requested_by: 'mock-user-2',
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'mock-decision-3',
    project_id: 'mock-project-1',
    title: 'Exterior Paint Color',
    description: 'Final decision on exterior paint color scheme',
    category: 'Design',
    status: 'pending',
    due_date: '2024-03-15',
    requested_by: 'mock-user-2',
    created_at: '2024-01-25T00:00:00Z',
  },
  {
    id: 'mock-decision-4',
    project_id: 'mock-project-2',
    title: 'Flooring Material Choice',
    description: 'Decide between hardwood, laminate, or tile',
    category: 'Materials',
    status: 'pending',
    due_date: '2024-02-25',
    requested_by: 'mock-user-2',
    created_at: '2024-02-08T00:00:00Z',
  },
];

// Mock Cost Changes
export const mockCostChanges: CostChange[] = [
  {
    id: 'mock-cost-1',
    project_id: 'mock-project-1',
    title: 'Additional Kitchen Cabinetry',
    category: 'Kitchen',
    original_cost: 5000,
    new_cost: 7500,
    reason: 'Client requested additional custom cabinetry units',
    status: 'pending',
    created_by: 'mock-user-2',
    created_at: '2024-01-22T00:00:00Z',
    estimated_days: 5,
  },
  {
    id: 'mock-cost-2',
    project_id: 'mock-project-1',
    title: 'Upgrade to Premium Flooring',
    category: 'Flooring',
    original_cost: 3500,
    new_cost: 4500,
    reason: 'Upgraded to premium grade hardwood',
    status: 'approved',
    created_by: 'mock-user-2',
    created_at: '2024-01-15T00:00:00Z',
    estimated_days: 0,
  },
  {
    id: 'mock-cost-3',
    project_id: 'mock-project-1',
    title: 'Additional Electrical Outlets',
    category: 'Electrical',
    original_cost: 1200,
    new_cost: 1800,
    reason: 'Added 10 additional outlets as per client request',
    status: 'pending',
    created_by: 'mock-user-2',
    created_at: '2024-01-28T00:00:00Z',
    estimated_days: 2,
  },
  {
    id: 'mock-cost-4',
    project_id: 'mock-project-2',
    title: 'Window Replacement',
    category: 'Windows',
    original_cost: 2500,
    new_cost: 3200,
    reason: 'Upgraded to energy-efficient double-glazed windows',
    status: 'approved',
    created_by: 'mock-user-2',
    created_at: '2024-02-10T00:00:00Z',
    estimated_days: 0,
  },
];

// Helper function to filter by project
export function getMockProducts(projectId: string | null): Product[] {
  if (!projectId) return [];
  return mockProducts.filter((p) => p.project_id === projectId);
}

export function getMockMilestones(projectId: string | null): Milestone[] {
  if (!projectId) return [];
  return mockMilestones.filter((m) => m.project_id === projectId);
}

export function getMockDecisions(projectId: string | null): Decision[] {
  if (!projectId) return [];
  return mockDecisions.filter((d) => d.project_id === projectId);
}

export function getMockCostChanges(projectId: string | null): CostChange[] {
  if (!projectId) return [];
  return mockCostChanges.filter((c) => c.project_id === projectId);
}

export function getMockProject(projectId: string | null): ProjectType | null {
  if (!projectId) return null;
  return mockProjects.find((p) => p.id === projectId) || null;
}

// Mock Paint Colors
export const mockPaintColors: PaintColor[] = [
  {
    id: 'mock-paint-1',
    project_id: 'mock-project-1',
    name: 'Classic White',
    code: 'CW-001',
    hex_color: '#FFFFFF',
    room: 'Living Room',
    brand: 'Dulux',
    status: 'approved',
    is_selected: true,
    added_by: 'mock-user-1',
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'mock-paint-2',
    project_id: 'mock-project-1',
    name: 'Warm Grey',
    code: 'WG-042',
    hex_color: '#8B8B8B',
    room: 'Bedroom',
    brand: 'Farrow & Ball',
    status: 'pending',
    is_selected: false,
    added_by: 'mock-user-1',
    created_at: '2024-01-12T00:00:00Z',
  },
  {
    id: 'mock-paint-3',
    project_id: 'mock-project-2',
    name: 'Ocean Blue',
    code: 'OB-156',
    hex_color: '#4A90E2',
    room: 'Bathroom',
    brand: 'Benjamin Moore',
    status: 'approved',
    is_selected: true,
    added_by: 'mock-user-1',
    created_at: '2024-02-05T00:00:00Z',
  },
];

export function getMockPaintColors(projectId: string | null): PaintColor[] {
  if (!projectId) return [];
  return mockPaintColors.filter((p) => p.project_id === projectId);
}

// Mock Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'mock-chat-1',
    project_id: 'mock-project-1',
    user_id: 'mock-user-1',
    content: 'Good morning! Just wanted to check in on the progress for today.',
    created_at: '2024-01-20T09:00:00Z',
    photo_urls: null,
  },
  {
    id: 'mock-chat-2',
    project_id: 'mock-project-1',
    user_id: 'mock-user-2',
    content: 'Morning! We\'re making great progress on the framing. Should have photos to share by this afternoon.',
    created_at: '2024-01-20T09:15:00Z',
    photo_urls: null,
  },
  {
    id: 'mock-chat-3',
    project_id: 'mock-project-1',
    user_id: 'mock-user-1',
    content: 'Perfect! Looking forward to seeing them.',
    created_at: '2024-01-20T09:20:00Z',
    photo_urls: null,
  },
  {
    id: 'mock-chat-4',
    project_id: 'mock-project-1',
    user_id: 'mock-user-2',
    content: 'Quick question about the kitchen layout - should we proceed with the island design we discussed?',
    created_at: '2024-01-20T14:30:00Z',
    photo_urls: null,
  },
  {
    id: 'mock-chat-5',
    project_id: 'mock-project-1',
    user_id: 'mock-user-1',
    content: 'Yes, let\'s go with the island design. It looks great!',
    created_at: '2024-01-20T15:00:00Z',
    photo_urls: null,
  },
  {
    id: 'mock-chat-6',
    project_id: 'mock-project-2',
    user_id: 'mock-user-1',
    content: 'Hi team, when can we schedule the demolition?',
    created_at: '2024-02-05T10:00:00Z',
    photo_urls: null,
  },
  {
    id: 'mock-chat-7',
    project_id: 'mock-project-2',
    user_id: 'mock-user-2',
    content: 'We can start next Monday. I\'ll send you the detailed schedule.',
    created_at: '2024-02-05T10:30:00Z',
    photo_urls: null,
  },
];
