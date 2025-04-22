export interface StoryReviewType {
  _id: any;
  userId: any;
  storyId: any;
  stars: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryReviewWithDetails extends StoryReviewType {
  userName: string;
  storyName: string;
}
