import Image from 'next/image';
import Demo from 'shared/components/Demo';
import DemoPanel from 'shared/components/DemoPanel';
import { l } from 'to-line';

export default ({ className }: any) =>
    <Demo $py={0}>
        <DemoPanel>
            <p className={l('my:0 fg:major', className)}>
                <span className='bg-stripe-pink box:slice rounded'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et elit dictum, tempor augue quis, rhoncus enim. Nunc lacinia, velit vel convallis tincidunt, ante nisi maximus nunc, at aliquam nisi lectus in mauris.
                </span>
            </p>
        </DemoPanel>
    </Demo>