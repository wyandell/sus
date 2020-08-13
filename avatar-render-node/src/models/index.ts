export class Command {
    command: string;
    args: any;
    id: number;
}

export class AvatarRenderRequest {
    userId: number;
    bodyColors: {
        headColorId: number;
        torsoColorId: number;
        rightArmColorId: number;
        leftArmColorId: number;
        rightLegColorId: number;
        leftLegColorId: number;
    };
    assets: [
        {
            id: number;
        }
    ];
}