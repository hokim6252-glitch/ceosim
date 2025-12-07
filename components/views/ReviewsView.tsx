import React from 'react';
import Card from '../ui/Card';
import { useGameState } from '../../context/GameContext';
import Button from '../ui/Button';

const ReviewsView: React.FC = () => {
    const { reviews, projects } = useGameState();

    const getProjectName = (projectId: string) => {
        return projects.find(p => p.id === projectId)?.name || '알 수 없는 게임';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">리뷰 및 운영 관리</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="출시된 게임 리뷰">
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <div key={review.projectId} className="bg-gray-800 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-cyan-400">{getProjectName(review.projectId)}</h3>
                                    <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                                        <div>
                                            <p className="text-sm text-gray-400">전문가 점수</p>
                                            <p className="text-2xl font-bold">{review.expertScore}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">유저 평점</p>
                                            <p className="text-2xl font-bold">{review.userRating.toFixed(1)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">전체 리뷰</p>
                                            <p className="text-2xl font-bold">{review.overallScore}%</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">출시된 게임이 없습니다.</p>
                    )}
                </Card>

                <Card title="운영 시스템">
                    <div className="space-y-3">
                        <p className="text-gray-400 text-sm mb-4">출시된 게임의 가치를 높이고 수명을 연장하기 위한 운영 활동을 관리합니다.</p>
                        <Button variant="secondary" className="w-full justify-start text-left">시즌 패스/이벤트</Button>
                        <Button variant="secondary" className="w-full justify-start text-left">버그 패치</Button>
                        <Button variant="secondary" className="w-full justify-start text-left">서버관리/보안관리</Button>
                        <Button variant="secondary" className="w-full justify-start text-left">과금 모델 변경</Button>
                        <Button variant="secondary" className="w-full justify-start text-left">장기 업데이트 로드맵</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ReviewsView;
