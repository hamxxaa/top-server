module.exports = {
    ball: [
        {
            id: '0',
            x: 500,
            y: 300,
            radius: 10,
            density: 0.001
        },
        {
            id: '-20',
            x: 500,
            y: 300,
            radius: 10,
            density: 0.001
        },
    ],
    score: [
        {
            id: '-1',
            x: 50,
            y: 50,
            style:
            {
                fontSize: '32px',
                fill: '#ff123f'
            }
        },
        {
            id: '-2',
            x: 700,
            y: 50,
            style:
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        }
    ],
    goalline: [
        {
            id: '-3',
            x: 80,
            y: 250,
            angle: Math.PI / 6,
            width: 10,
            height: 100,
            fillColor: '0xffffff',
            goalareaoffset: -15,
            posts:
            {
                radius: 8,
                fillColor: '0x000000'
            }
        },
        {
            id: '-4',
            x: 820,
            y: 250,
            angle: 0,
            width: 10,
            height: 100,
            fillColor: '0xffffff',
            goalareaoffset: 15,
            posts:
            {
                radius: 8,
                fillColor: '0x000000'
            }
        }
    ],
    obstacles: [
        {
            id: '-5',
            config:
            {
                type: 'rectangle',
                x: 500,
                y: 500,
                width: 30,
                height: 30,
                fillColor: '0xffffff',
                options:
                {
                    isStatic: true,
                    density: 0.001
                }
            }
        },
        {
            id: '-6',
            config: {
                type: 'circle',
                x: 600,
                y: 600,
                radius: 20,
                fillColor: '0xff123f',
                options:
                {
                    isStatic: true,
                    density: 0.001
                }
            }
        },
        {
            id: '-7',
            config:
            {
                type: 'polygon',
                x: 700,
                y: 700,
                path:
                    [{ x: 0, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }],
                fillColor: "0xcf1a48",
                options:
                {
                    isStatic: true,
                    density: 0.001
                }
            }
        },
        {
            id: '-52',
            config:
            {
                type: 'rectangle',
                x: 700,
                y: 500,
                width: 100,
                height: 100,
                fillColor: '0xfac14e',
                options:
                {
                    isStatic: false,
                    density: 0.000001
                }
            }
        },
    ]
}