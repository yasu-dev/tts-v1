import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // スタッフタスクデータをPrismaから取得
    const allTasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // レスポンスデータ構築
    const staffTasksData = {
      summary: {
        total: allTasks.length,
        urgent: allTasks.filter(task => task.priority === 'urgent' || task.priority === 'high').length,
        completed: allTasks.filter(task => task.status === 'completed').length,
        pending: allTasks.filter(task => task.status === 'pending').length,
        inProgress: allTasks.filter(task => task.status === 'in_progress').length
      },
      tasks: {
        all: allTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee: task.assignedTo || 'システム',
          dueDate: task.dueDate?.toISOString(),
          category: task.category,
          estimatedDuration: task.estimatedTime,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString()
        }))
      }
    };

    return NextResponse.json(staffTasksData);
  } catch (error) {
    console.error('[ERROR] Staff tasks API:', error);
    
    return NextResponse.json(
      { error: 'スタッフタスクデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}