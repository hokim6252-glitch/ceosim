import React from 'react';
import Card from '../ui/Card';

const SettingsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">설정</h1>
            <Card title="게임 설정">
                <p className="text-gray-400">게임 난이도, 자동 저장 간격 등 게임 플레이와 관련된 설정을 관리합니다. (추후 업데이트 예정)</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="사운드 설정">
                    <p className="text-gray-400">배경 음악, 효과음 볼륨 등 사운드 관련 설정을 관리합니다. (추후 업데이트 예정)</p>
                </Card>
                <Card title="그래픽 설정">
                     <p className="text-gray-400">해상도, 그래픽 품질 등 시각적 요소를 설정합니다. (추후 업데이트 예정)</p>
                </Card>
            </div>
        </div>
    );
};

export default SettingsView;
