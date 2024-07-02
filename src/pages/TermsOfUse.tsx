import { Page } from 'components/Page';
import { Navigate } from 'components/navigate/Navigate';

export const TermsOfUse = () => {
  return (
    <Page title={'Terms of Use'}>
      <div className={'legal'}>
        <span>Last updated: 11 May, 2023</span>
        <p className="uppercase">
          PLEASE READ THEse TErms of use Carefully. Your ACCEPTANCE MAY LIMIT OR
          WAIVE CERTAIN OF YOUR RIGHTS. if you have not reviewed the terms of
          use since the “last updated” date above, It is your responsibility to
          re-review Them.
        </p>
        <p className="uppercase">
          THESE TERMS OF USE provide for mandatory individual arbitration in
          SWITZERLAND. by accepting these terms, you HEREBY IRREVOCABLY WAIVE
          ALL RIGHTS TO TRIAL BY JURY or to proceed in a collective action in
          relation to your use of the bancor.network site OR THE CONTENT made
          available through the site.
        </p>
        <p className="uppercase">
          YOu hereby agree not to use the site OR THE CONTENT for RestricTed
          uses or from prohibited jurisdictions.
        </p>

        <p className="uppercase">
          IF YOU DO NOT AGREE TO ANY OF THESE TERMS OF USE OR THE PRIVACY POLICY
          AVAILABLE AT{' '}
          <Navigate to="HTTPS://APP.BANCOR.NETWORK/PRIVACY-POLICY">
            HTTPS://APP.BANCOR.NETWORK/PRIVACY-POLICY
          </Navigate>
          , PLEASE IMMEDIATELY CEASE ALL USE OF THE SITE AND THE CONTENT.
        </p>

        <p>
          By accessing or using{' '}
          <Navigate to="https://bancor.network">
            https://bancor.network
          </Navigate>
          , and any linked or directed subdomain therein (
          <Navigate to="https://app.bancor.network">
            https://app.bancor.network
          </Navigate>
          ) (collectively, the “<b>Site</b>”) and any content made available on
          or through the Site, you (the “<b>User</b>” and collectively with
          others using the Site, the “<b>Users</b>”) agree to be bound by these
          Terms of Use (these “<b>Terms</b>”). The rights in the Site are held
          by Bprotocol Foundation, a Swiss foundation, with legal seat in Zug,
          Switzerland, registered in the Swiss commercial register under UID
          CHE-181.679.849 (the “<b>Foundation</b>”), and the terms “we,” “us,”
          and “our” refer to the Foundation. Please read these Terms carefully.
          These Terms govern your access to and use of the Site and Content (as
          defined herein).
        </p>

        <p>
          By using the Content or visiting the Site, you signify your consent to
          both these Terms and our privacy policy (the “<b>Privacy Policy</b>”),
          a current version of which is available at{' '}
          <Navigate to="https://app.bancor.network/privacy-policy">
            https://app.bancor.network/privacy-policy
          </Navigate>
          , which is incorporated herein by reference and which may be modified
          from time to time. In the event of any change, amendment or update to
          these Terms or the Privacy Policy by us, you agree to be bound by
          these Terms and the Privacy Policy, as may be amended, if you continue
          thereafter using the Site or any of the Content after notice that
          there has been a change, amendment or update, which may take the form
          of alerting you to the “last updated” date so that you can determine
          whether there has been an update since your last review, or any other
          form of notice that we elect to provide in our sole discretion. No
          information contained in or on the Site or through the Content shall
          constitute a part of these Terms or the Privacy Policy unless
          otherwise expressly stated herein or in the Privacy Policy.
        </p>

        <h2>1. Eligibility; Prohibition of Use</h2>
        <p>
          By accessing or using the Site or the Content, you represent and
          warrant that you will not use the Site if the laws of any jurisdiction
          applicable to you or in your country of residency and/or citizenship
          prohibit you from doing so in accordance with these Terms. The Site is
          not available to U.S. residents and/or domiciliaries. In addition, by
          accessing and using the Site or the Content, you represent and warrant
          that you are not subject to personal sanctions issued by the United
          Nations, United States, European Union or Switzerland and that you
          will not perform or attempt to perform Token conversions or
          transactions through the Site, if: (1) you are a U.S. resident and/or
          domiciliary; or (2) you are using the Site or the Content from one of
          the countries designated as high risk by the Financial Action Task
          Force or embargoed or restricted by the Swiss State Secretariat for
          Economic Affairs (SECO), the United Nations, the European Union or the
          U.S. Office of Foreign Asset Control of the United States Treasury
          Department, such as (but not limited to): Belarus, Burundi, Central
          African Republic, Congo, DPRK (North Korea), Guinea, Guinea-Bissau,
          Iran, Iraq, Lebanon, Libya, Mali, Myanmar (Burma), Republic of South
          Sudan, Russia, Somalia, Sudan, Syria, Ukraine, Venezuela, Yemen or
          Zimbabwe. Pursuant to applicable laws and regulations, the Foundation
          maintains the right to select its markets and jurisdictions to operate
          and may restrict or deny the use of the Site, the Content or any part
          thereof, in certain countries at its discretion (such jurisdictions
          referenced in the foregoing clauses (1) and (2), the “
          <b>Prohibited Jurisdictions</b>”).
        </p>

        <h2>2. Site Content</h2>
        <p>
          The Site offers a user interface that may display information related
          to certain blockchain networks, and that may assist with formatting or
          generating standardized transaction messages that a user may elect to
          use in connection with third-party software in order to interact with
          smart contracts deployed on those blockchain networks (such
          information, messages, and any other functionalities as may be
          provided on or through the Site from time to time, the “<b>Content</b>
          ”).
        </p>
        <p className={'uppercase'}>
          THE SITE DOES NOT EXECUTE TRANSACTIONS ON BEHALF OF USERS, NOR CONTROL
          THE EXECUTION OF TRANSACTIONS; THE FOUNDATION AND ITS AFFILIATES HAVE
          NO RESPONSIBILITY FOR ANY THIRD-PARTY SOFTWARE USED BY A USER TO
          EFFECTUATE TRANSACTIONS.
        </p>

        <p>
          Through the Site, you can:
          <ol>
            <li>
              View information relating to different cryptographic assets
              commonly referred to as tokens, such as tokens created using the
              ERC20 standard on the Ethereum blockchain network (“<b>Tokens</b>
              ”);
            </li>
            <li>
              View information from supported electronic wallets used to manage
              blockchain addresses (each, an “<b>Electronic Wallet</b>” or “
              <b>Wallet</b>”);
            </li>
            <li>
              Format messages and data (with the assistance of the Site’s
              interfaces), which you may then use to interact, or to instruct
              third-party software to interact, with certain blockchain networks
              in order to execute transactions through your Wallet;
            </li>
            <li>
              Access the Bancor Governance Forum (
              <Navigate to={'https://gov.bancor.network/'}>
                https://gov.bancor.network/
              </Navigate>
              ), which has its own Terms of Use available at{' '}
              <Navigate to={'https://gov.bancor.network/tos'}>
                https://gov.bancor.network/tos
              </Navigate>
              .
            </li>
            <li>
              Find information concerning, and navigate to the websites of,
              certain third party service providers such as Fiat Gateway
              Providers.
            </li>
          </ol>
          Detailed descriptions of the Content and functionality available
          through the Site is available at the Bancor Help Center (
          <Navigate to={'https://support.bancor.network/hc/en-us'}>
            https://support.bancor.network/hc/en-us
          </Navigate>{' '}
          (the “Help Center”)).
        </p>

        <p className={'uppercase'}>
          USERS SHOULD REVIEW THE HELP CENTER PERIODICALLY FOR UPDATES, AND FOR
          INFORMATION ON ANY CONTENT OR SERVICE WITH WHICH THEY ARE UNFAMILIAR.
        </p>

        <h2>3. Bancor Liquidity Pools</h2>

        <p>
          The Bancor Protocol or Bancor Network is made up of a series of smart
          contracts designed to pool liquidity and perform peer-to-contract
          trades in a single transaction with no counterparty (the “
          <b>Bancor Liquidity Pools</b>”). The Bancor Liquidity Pools are
          deployed on public blockchains and make use of Bancor Network Tokens
          (“<b>BNT</b>”) and other Tokens to provide a variety of functions as
          described more fully in the Help Center, and governed through a
          decentralized autonomous organization referred to as “<b>BancorDAO</b>
          ”. For more information on BancorDAO, please visit{' '}
          <Navigate
            to={
              'https://support.bancor.network/hc/en-us/articles/5425550065426-What-is-the-Bancor-DAO-'
            }
          >
            https://support.bancor.network/hc/en-us/articles/5425550065426-What-is-the-Bancor-DAO-
          </Navigate>
          .
        </p>

        <p>
          BancorDAO may determine to update or deploy additional Bancor
          Liquidity Pools or other smart contracts in order to, among other
          things, add new features or functionalities, or respond to events such
          as chain migrations, security incidents, vulnerabilities, “forks” or
          other changes to the underlying blockchain.
        </p>

        <p>
          Because the Bancor Liquidity Pools are deployed on public blockchain
          networks, they are directly accessible through command lines, command
          prompts or through other decentralized applications (dApps) or third
          party interfaces. The User does not need to use the Site in order to
          interact with the Bancor Liquidity Pools. It is the User’s sole
          responsibility to accurately communicate and effect transactions to
          interact with the Bancor Liquidity Pools.
        </p>

        <h2>4. Fees and Payments</h2>

        <p>
          The Foundation does not charge or receive fees for use of the Site or
          the Content. The Bancor Protocol may assess fees for use of the
          protocol, and those fees may change, both as determined by BancorDAO.
          For more information on the current fee structure, please visit{' '}
          <Navigate
            to={
              'https://docs.bancor.network/developer-guides/read-functions/trades/tradingfeepmm'
            }
          >
            https://docs.bancor.network/developer-guides/read-functions/trades/tradingfeepmm
          </Navigate>
          .
        </p>

        <p>
          Use of the Site and Content is not subject to or conditioned upon any
          payment or fee to the Foundation. By using this Site, you confirm that
          you are aware that transactions on public blockchains such as the
          Ethereum blockchain are often subject to a fee (referred to as “Gas”
          on Ethereum), which is typically paid in the native cryptocurrency of
          the blockchain and transferred internally into the system. To
          facilitate transactions on the blockchain you must have a sufficient
          amount of the crypto asset required for any applicable blockchain
          fees.
        </p>

        <p>
          When using the Content, you are able to construct and determine, at
          your own discretion, the parameters you wish to apply to your
          conversion of Tokens. The actions you wish to execute will be subject
          to those parameters you applied. Such terms, as may be applicable in
          each case individually, will be reflected and expressed in the
          conversion ratio and other applicable formulas, affecting the final
          outcome of your actions. By using the Content, you confirm and accept
          you are aware of the intrinsic risks regarding your use of the
          Content, that you are capable of assessing and determining the
          outcomes of your actions using the Content, and that you are
          exclusively responsible and liable for your actions and their results.
          The Foundation and/or Foundation Parties are not responsible for any
          taxes, levies, charges and/or expenses of any kind you may incur,
          resulting from your use of the Site, the Content and/or in connection
          therewith, whether such may be incurred pursuant to any applicable
          laws, rules or regulations, by any third party service provider(s), or
          otherwise. Any and all such taxes, levies, charges and/or expenses of
          any kind shall be borne solely by you. You agree that you shall have
          no claim, suit or demand of any kind, and by agreeing to these Terms,
          hereby irrevocably and completely waive any such claim, suit or demand
          of any kind, to the extent such may exist or hereafter arise, towards
          us, our affiliated entities, and any of our directors, officers,
          managers, employees or consultants, in connection with or related to
          any of the foregoing.
        </p>

        <h2>5. Rules of Use</h2>

        <p>
          You represent and warrant that you have full right and authority to
          use the Site, the Content and to be bound by these Terms. You agree
          that you will comply fully with these Terms and all applicable
          domestic and international laws, regulations, statutes and ordinances
          that govern your use of the Site and/or the Content. Without limiting
          the foregoing and in recognition of the global nature of the Internet,
          you agree to comply with all local and international rules regarding
          online conduct. You also agree to comply with all applicable laws,
          rules and regulations affecting the transmission of content or the
          privacy of persons.
        </p>

        <p>
          When using the Site or Content, you may not, nor may you assist other
          parties to pursue or engage in unlawful or abusive uses, or any types
          of activities which contradict the purpose of the Site or Content,
          which hinder the Site’s operation or the Content to other Users, or
          which may be deemed to do so (“<b>Restricted Uses</b>”). For clarity
          and reference, Restricted Uses include, but are not limited to, these
          types of activities as detailed herein, as we may amend from time to
          time in our sole discretion (thus, not to be regarded as an exhaustive
          list):
        </p>

        <ul>
          <li>
            Unlawful Activities, such as activities which:
            <ol>
              <li>violate any applicable law, rule or regulation; or</li>
              <li>
                publish, distribute or disseminate any unlawful material or
                information;
              </li>
            </ol>
          </li>
          <li>
            Undermining or Abusive Activities, such as activities which:
            <ol>
              <li>
                take any action that imposes an unreasonable or
                disproportionately large load on our infrastructure, or
                detrimentally interfere with, intercept, or expropriate any
                system, data, or information;
              </li>
              <li>
                institute, assist or become involved in any type of attack
                (deliberate or other) upon the Site or Content that prevents or
                disrupts the access to or the use of the Bancor Protocol, the
                Bancor Network, or any of the Bancor Liquidity Pools;
              </li>
              <li>
                enter or make an attempt to enter the Site and Content
                (including by accessing linked platforms, networks or systems)
                without authorization, including by password mining, through a
                virtual private network (VPN) from a Prohibited Jurisdiction
                and/or by using other Users’ information;
              </li>
              <li>
                design or assist in designing cheats, exploits, automation
                software, bots, hacks, modes or any other unauthorized
                third-party software to modify or interfere with the Site or the
                Content;
              </li>
              <li>
                attempt to disable or circumvent any security or access control
                mechanism of the Site or the Content;
              </li>
              <li>
                use any unauthorized third-party software that accesses,
                intercepts, 'mines', or otherwise collects information from or
                through the Content or the Site, or that is in transit from or
                to the Site;
              </li>
              <li>
                bypass any robot exclusion headers or other measures the
                Foundation uses to restrict access to the Content or use any
                software, technology, or device to send content or messages, or
                scrape, spider, or crawl the Content, or harvest or manipulate
                data;
              </li>
              <li>
                solicit another User’s password or other personal information
                under false pretenses; or
              </li>
              <li>
                any action which does or could be expected to bring disrepute
                upon or be detrimental to the Foundation, any Foundation Party,
                the Site or the Content;
              </li>
            </ol>
          </li>
          <li>
            Activities Abusive to Other Users or Their Rights, such as
            activities which:
            <ol>
              <li>
                interfere with other Users’ ability to access the Site or any of
                the Content;
              </li>
              <li>
                attempt to, or harass, abuse, or harm of another person or
                entity, including the Foundation’s directors, officers,
                employees, representatives and service providers;
              </li>
              <li>
                collect, harvest or post anyone’s private information, in any
                media format;
              </li>
              <li>
                impersonate another User or otherwise misrepresent yourself;
              </li>
              <li>
                violate the legal rights of others, including defaming, abusing,
                stalking or threatening Users; or
              </li>
              <li>
                defraud any other Users or any other person or entity, including
                the Foundation’s directors, officers, employees, representatives
                and service providers, including by providing false, inaccurate,
                misleading, or partial information;
              </li>
              <li>
                Activities Infringing Intellectual Property, such as activities
                which:
              </li>
              <li>
                reverse engineer, decompile, disassemble, decipher or otherwise
                attempt to derive the source code for any underlying software or
                other intellectual property used to provide the Content, or to
                obtain any information from the Content using any method unless
                you have received the Foundation’s prior written approval;{' '}
              </li>
              <li>
                infringe the intellectual property rights, privacy rights, or
                moral rights of the Foundation or any Foundation Party; or
              </li>
              <li>
                imply an untrue endorsement by or affiliation with the
                Foundation or any Foundation Party;
              </li>
            </ol>
          </li>
          <li>
            Unfair or Abusive Transacting, such as activities which:
            <ol>
              <li>
                create or enter a fictitious transaction or a transaction with
                fictitious elements of any kind;
              </li>
              <li>
                exploit, disrupt or manipulate, or attempt to exploit, disrupt
                or manipulate the Site or the use of the Content, in a manner
                designed to create transaction conditions which are not
                available to other Users; or
              </li>
              <li>
                utilizes or applies technological abilities or foreknowledge not
                exploited or available to other Users, to perform (including off
                the Site) transactions using unequal terms among Users regarding
                the use of the Content on the Site, influence the terms of
                transactions on the blockchain (including activities commonly
                referred to as Front-Running) and/or create an unfair or abusive
                advantage over other Users;
              </li>
            </ol>
          </li>
        </ul>

        <p>
          Violation of any of these Restricted Uses may be cause for the taking
          of legal actions on the part of the Foundation or any Foundation Party
          under law, in addition to any other rights and remedies available to
          the Foundation or any Foundation Party under law. Without derogating
          from the above, by accepting these Terms, you acknowledge that neither
          the Foundation or any Foundation Party makes any representation or
          warranty regarding their ability, nor assumes any liability, to
          detect, limit or prevent any Restricted Use.
        </p>

        <h2>
          6. Limitation or Termination of Access and Services; Limited License
        </h2>

        <p>
          Subject to your agreement and compliance with these Terms, you are
          hereby granted with a personal, revocable, non-transferable and
          non-exclusive right to use the Content. Use of the Content shall be
          solely for your own, private purposes and for no other purpose
          whatsoever. You hereby acknowledge that your right to use the Content
          is limited by these Terms, and, if you violate or if, at any point,
          you do not agree to any of these Terms, your right to use the Content
          shall immediately terminate, and you shall immediately refrain from
          using the Content. Without derogating from the generality of the
          foregoing, any use of the Content that violates these Terms is
          strictly prohibited and can, at the Foundation’s sole discretion,
          result in the immediate revocation of your limited rights granted by
          these Terms.
        </p>

        <p>
          Without limiting any other remedy, the Foundation may limit, suspend,
          revoke, terminate, modify, or delete your use of the Site or access to
          the Content at its sole discretion without prior notice or liability,
          if you are, or if the Foundation suspects (in its sole discretion)
          that you are failing to comply with these Terms or for any actual or
          suspected Restricted Use of the Site and Content. Any of such actions,
          including the termination of your rights to use the Site and Content,
          may be applied by the Foundation permanently or temporarily. In such
          an event, the Foundation may terminate your use of and access to the
          Site and Content (however without affecting your Wallet, which remains
          exclusively yours, subject to any applicable third party terms of use
          or laws, rules or regulations). You hereby acknowledge and agree that
          the Foundation is under no obligation to compensate you for any losses
          of any kind whatsoever resulting from the termination of your access
          as set forth hereinabove, whether such termination was voluntary or
          involuntary, and you hereby irrevocably waive any demand or claim
          regarding the above.
        </p>

        <h2>7. Ownership, Copyrights</h2>

        <p>
          The Site, the Content and all of the content that appears in the Site,
          including without limitation, the use of the Site’s name, software,
          web technologies, source code, concepts, artwork, photos, animations,
          sounds, methods of operation, moral rights, documentation, and virtual
          items, is the exclusive property of the Foundation, or is being used
          with permission from its licensors. The Foundation (or its licensors
          as applicable) retain all rights, title and interest in and to the
          Site, the Content and all of the content that appears in the Site, and
          all intellectual property rights relating thereto, including without
          limitations all copyright, patent, trademarks, logos, design rights
          and any other proprietary rights connected with the Content. The
          Foundation’s name and logo, and any other trademarks included in the
          Content and/or appear on the Site, are trademarks of the Foundation.
          Notwithstanding any provision to the contrary herein, you agree that
          (i) you have no right or title in or to the Content and/or to any
          content that appears in the Site and (ii) certain aspects of the Site
          and the Content may use, incorporate or link to certain open-source
          components and that your use of the Site and the Content is subject
          to, and you will comply with, any applicable open-source licenses that
          govern any such open-source components (collectively, the “
          <b>Open-Source Licenses</b>”). Without limiting the generality of the
          foregoing, you may not (a) resell, lease, lend, share, distribute or
          otherwise permit any third party to use the Site or the Content; (b)
          use the Site or the Content for time-sharing or service bureau
          purposes; or (c) otherwise use the Site or the Content in a manner
          that violates the Open-Source Licenses.
        </p>

        <p>
          All third party product names that may legitimately appear in the Site
          are trademarks of their respective owners. No transfer or grant of any
          rights under any names, marks or logos is made or is to be implied by
          any provision of these Terms or by anything on the Site, and all
          rights in such names, marks or logos are reserved to the Foundation or
          their respective owners, as applicable.
        </p>

        <p>
          You acknowledge and agree that any materials, including but not
          limited to questions, comments, feedback, suggestions, ideas, plans,
          notes, drawings, original or creative materials or other information
          or commentary you provide on our platform or one of our social media
          accounts, regarding the Foundation, the Site or the Content
          (collectively, “<b>Feedback</b>”) that are provided by you, whether by
          email, posting to the Site or otherwise, are non-confidential and will
          become the sole property of the Foundation. The Foundation will own
          exclusive rights, including all intellectual property rights, and will
          be entitled to the unrestricted use and dissemination of such Feedback
          for any purpose, commercial or otherwise, without acknowledgment or
          compensation to you.
        </p>

        <h2>8. Third Party Content</h2>

        <p>
          To the extent that the Site or the Content contain links or any other
          information to third party websites, Tokens or services, the
          Foundation does not control the availability and content of those
          websites, Tokens and services. Any concerns regarding any such third
          party websites, Tokens and/or service, or any link thereto, should be
          directed to such particular website and/or services provider. The
          Foundation makes no representation or warranty regarding any content,
          goods, Tokens and/or services provided by any third party, even if
          linked to through the Site or including in any Third Party Integrated
          Application. The linked sites and Tokens are not under the control of
          the Foundation and may collect data or solicit personal information
          from you. The Foundation is not responsible for their content,
          business practices or privacy policies, or for the collection, use or
          disclosure of any information those sites may collect. You agree that
          the Site and the Content may feature advertisements from third
          parties. The Foundation is not responsible for the actions of third
          parties who advertise on the Site. Your interactions with advertisers
          or entities that issued the Tokens are agreements between you and
          them, with the Foundation having no responsibility in connection with
          losses or claims arising therefrom.
        </p>

        <h2>9. RISKS Statement, Representations and Warranties</h2>

        <p>
          The Foundation provides does not advise on the merits of any
          particular conversion or other transaction of Tokens or its tax or
          legal consequences. Users are solely liable for any action performed
          on the Site or using the Content, including any that cause financial
          loss to any User. The Site and the Foundation are not responsible for
          indicating, alerting or warning against any such actions, and it is
          the User’s sole responsibility to verify the performance of any
          transaction contemplated or consummated through the Site or the
          Content. As a general matter, Users should be aware of the following
          prior to utilizing the Site or the Content:
        </p>

        <p>
          <u>Risks of Cryptographic Systems and Currencies</u>. By using the
          Site or the Content in any way, you acknowledge the inherent risks
          associated with cryptographic systems and ecosystems; and represent
          and warrant that you have an understanding of the usage and
          intricacies of native cryptographic tokens. You understand that
          blockchain technologies (such as Ethereum) and associated currencies
          or tokens are highly volatile due to many factors including but not
          limited to adoption, speculation, technology and security risks. You
          also acknowledge that the cost of transacting on such technologies
          (where applicable) is variable and may increase at any time causing
          impact to any activities taking place on the relevant blockchain (such
          as Ethereum). You acknowledge these risks and represent, warrant and
          agree that the Foundation cannot be held liable for such fluctuations
          or increased costs. The Foundation shall not be held liable for any
          losses or damages resulting from the use of the Site, the Content or
          the services of any third-party provider (including through any Third
          Party Integrated Application).
        </p>

        <p>
          <u>Technological Knowledge Required</u>. Understanding Tokens requires
          advanced technical knowledge. Tokens are often described in
          exceedingly technical language that requires a comprehensive
          understanding of applied cryptography and computer science in order to
          appreciate inherent risks. Listing of a Token on the Site does not
          indicate the Foundation’s approval or disapproval of the underlying
          technology regarding any Token, and should not be used as a substitute
          for your own understanding of the risks specific to each Token. In
          using the Site and the Content, you represent that you have been, are,
          and will be solely responsible for making your own independent
          appraisal and investigations into the risks relating to and concerning
          the Tokens. You represent that you have sufficient knowledge, market
          sophistication, professional advice and experience to make your own
          evaluation of the merits and risks of any conversion or any underlying
          Token.
        </p>

        <p>
          <u>Token and Conversion Risks</u>. You represent and warrant you
          accept the risk of deploying Tokens to provide liquidity and/or
          converting Tokens. You represent and warrant you understand the
          conversion of Tokens may use untested code and protocols. You accept
          the risk of conversion failure or fault. You agree not to hold the
          Foundation accountable for any related losses. Neither you nor we, can
          reverse, change or cancel a conversion of Tokens transaction marked as
          complete or pending. Conversion of Tokens using the Site and the
          Content is managed and confirmed via the relevant blockchain. You
          represent and warrant you understand that your relevant blockchain
          public address will be made publicly visible whenever you use the Site
          or the Content.
        </p>

        <p>
          <u>Compliance with Laws</u>. You represent and warrant you are
          responsible for complying with applicable law. You agree that the
          Foundation is not responsible for determining whether or which laws
          may apply to your conversions, including with respect to tax or money
          transferring regulations. You agree you are solely responsible for
          reporting and paying any taxes arising from your use of the Content.
        </p>

        <p>
          <u>Operational Challenges</u>. You represent and warrant that you are
          aware of and accept the risk of the Site’s and the Content’s
          operational challenges. The Site and the Content may experience
          sophisticated cyber-attacks, unexpected surges in activity, or other
          operational or technical difficulties, which may hinder the use of the
          Site or the Content or affect or even cause faults or failures in the
          conversion of Tokens. You agree not to hold the Foundation accountable
          for any related losses. We also do not own or control the underlying
          software protocols, which govern the operation of the Tokens supported
          on our platform. You acknowledge and agree that the underlying
          protocols may be subject to sudden changes in operating rules such as
          “forks”, and that such forks may materially affect the value,
          function, and even the name of the Tokens you store. In the event of a
          fork, you agree that we may suspend the Site or the Content (with or
          without advance notice to you) and that we may decide whether or not
          to support (or cease supporting) either branch of the forked protocol
          entirely. You acknowledge and agree that we assume absolutely no
          responsibility whatsoever in respect of an unsupported branch of a
          forked protocol; and that we are not responsible for operation of the
          underlying protocols and that we make no guarantee of their
          functionality, security, or availability.
        </p>

        <p>
          <u>No Advice</u>. The Foundation does not advise on converting risk.
          If at any point the Foundation or its representatives do provide
          converting recommendations, market commentary, or any other
          information, the act of doing so is incidental to your relationship
          with us and imposes no obligation of truth or due diligence on behalf
          of the Foundation or its representatives.
        </p>

        <p>
          In addition to the foregoing, you hereby represent and warrant as
          follows:
          <ol>
            <li>
              you acknowledge and agree that Tokens you are seeking to engage in
              staking in connection with the Site, if any, are not to be
              construed, interpreted, classified or treated as any kind of
              currency, debentures, stocks, shares or other form of securities;
            </li>
            <li>
              you acknowledge that no regulatory authority has examined or
              approved of these Terms, and the provision of these Terms to you
              does not imply that applicable laws, rule or regulations have been
              complied with;
            </li>
            <li>
              you have read and understood all of these Terms and the Privacy
              Policy;
            </li>
            <li>
              any Wallet provided by you is fully operational, secure and valid;
            </li>
            <li>
              you are not, and you are not acting on behalf of, (a) any person
              or entity seeking to access the Site or use the Content from
              within the Prohibited Jurisdictions or for any Restricted Use, or
              (b) any person (being a natural person) or entity who is citizen
              of, domiciled in, or resident of, a country whose laws prohibit or
              conflict with the access of the Site or use of the Content;
            </li>
            <li>
              these Terms constitute legal, valid and binding obligations on
              you, which are enforceable in accordance with these Terms, and
              neither your use of any of the Site or the Content, nor purchase,
              receipt or holding of any Tokens is in breach or contravention of
              any applicable laws, rules or regulations applicable to you;
            </li>
            <li>
              you will not, and will not attempt to, authorize anyone other than
              you to access any liquidity pool available through the Site or the
              Content using a Wallet owned by you or Address for which you
              control; and
            </li>
            <li>
              all of the above representations and warranties set forth in this
              Section 9 are true, complete, accurate and non-misleading from the
              time of your acceptance of these Terms, and shall be deemed
              renewed each time you use the Site.
            </li>
          </ol>
        </p>

        <h2>10. Disclaimers of Representations, Warranties and Liabilities</h2>

        <p>
          Notwithstanding any other provision in these Terms, to the fullest
          extent permitted by applicable laws, rule or regulations, you
          acknowledge and agree that neither the Foundation or any Foundation
          Party shall be liable to you or any person or entity in relation to:
          <ol>
            <li>
              failure, malfunction or breakdown of, or disruption to, the
              operation of the Foundation, the Site, the Content, the Bancor
              Liquidity Pools, Tokens, or any technology (including staking and
              smart contract technology) on which any of the foregoing rely or
              relies, including due to occurrences of a “fork”, network attacks,
              vulnerabilities, defects, flaws in programming or source code or
              otherwise, regardless of when such failure, malfunction,
              breakdown, or disruption occurs;
            </li>
            <li>
              any virus, error, bug, flaw or similar defect adversely affecting
              the operation, functionality, usage, storage, transmission
              mechanisms, transferability, tradeability and other material
              characteristics of the Site, the Content, any Tokens or the Bancor
              Liquidity Pools;
            </li>
            <li>
              decreases or volatility in trading prices or trading volume of
              Tokens;
            </li>
            <li>
              any prohibition, restriction or regulation by any Governmental
              Authority in any jurisdiction of the operation, functionality,
              usage, transmission mechanisms of the Content, the Site or the
              Bancor Liquidity Pools;
            </li>
            <li>
              any risks (whether direct, indirect or ancillary) associated with
              the Site, the Content, the Foundation or the Bancor Liquidity
              Pools; and
            </li>
            <li>
              any transaction fees which you may have to pay in connection with
              your use of the Site or the Content.
            </li>
          </ol>
          You acknowledge and agree that you shall access and use the Site and
          the Content at your own risk. The risks associated with handling
          Tokens can be substantial. You should, therefore, carefully consider
          whether your participation in the Content or the Site is suitable for
          you in light of your circumstances and financial resources. Neither
          the Foundation or any Foundation Party at any point in time assumes
          the risk of losses arising from or in connection with your use of the
          Site, the Content or the Bancor Liquidity Pools, whether or not such
          loss was due to factors beyond your or the Foundation’s control.
        </p>

        <p>
          In the event of any loss, hack or theft of Tokens, you acknowledge and
          confirm that you shall have no right(s), claim(s) or causes of action
          in any way whatsoever against the Foundation or any Foundation Party.
        </p>

        <p>
          You acknowledge and agree that neither the Foundation nor any
          Foundation Party bears any liability, for any interruptions or damage
          caused by any computer viruses, worms, spyware, scareware, Trojan
          horses, defects, corrupted files, hoaxes, or other malware that may
          affect your computer or other equipment, or any phishing, spoofing or
          other attack. You should also be aware that SMS and email services are
          vulnerable to spoofing and phishing attacks and should use care in
          reviewing messages purporting to originate from us. We advise the
          regular use of a reputable and readily available virus screening and
          prevention software.
        </p>

        <p>
          YOU UNDERSTAND, ACKNOWLEDGE AND ACCEPT THAT BLOCKCHAIN APPLICATIONS
          AND PROTOCOLS AND RELATED SERVICES ARE GENERALLY STILL IN AN EARLY
          DEVELOPMENT STAGE AND THEREFORE OF EXPERIMENTAL NATURE. YOU THEREFORE
          UNDERSTAND THAT THE SITE AND THE CONTENT ARE PROVIDED TO YOU ‘AS IS’
          AND WITHOUT WARRANTIES OR REPRESENTATIONS OF ANY KIND EITHER EXPRESSED
          OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE
          LAW, EACH OF THE FOUNDATION AND THE FOUNDATION PARTIES DISCLAIMS ALL
          REPRESENTATIONS AND WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT
          LIMITED TO, IMPLIED WARRANTIES OF ANY KIND IN CONNECTION WITH THE
          TOKENS, THE SITE, THE CONTENT, NON-INFRINGEMENT, AND FITNESS FOR ANY
          PARTICULAR PURPOSE, USEFULNESS, AUTHORITY, ACCURACY, COMPLETENESS
          AND/OR TIMELINESS. EACH OF THE FOUNDATION AND/OR FOUNDATION PARTIES
          MAKES NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR
          COMPLETENESS OF THE CONTENT OF THE SITE OR THE CONTENT, OF THE CONTENT
          OF ANY SITES LINKED TO THE SITE OR THE CONTENT, OF ANY THIRD PARTY
          MATERIALS OR THE UNDERLYING SOFTWARE PROTOCOL THAT GOVERNS THE
          CONTENT, THE SITE AND THE BANCOR LIQUIDITY POOLS. WITHOUT LIMITING THE
          FOREGOING, NONE OF THE FOUNDATION OR ANY OF ITS RESPECTIVE DIRECTORS,
          OFFICERS, EMPLOYEES, AGENTS, ATTORNEYS, THIRD-PARTY CONTENT PROVIDERS,
          DISTRIBUTORS, JOINT-VENTURES, REPRESENTATIVES, LICENSEES OR LICENSORS
          (COLLECTIVELY, “FOUNDATION PARTIES”) REPRESENT OR WARRANT THAT THE
          SITE AND THE CONTENT WILL BE UNINTERRUPTED, ERROR-FREE, BUG-FREE OR
          FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS. YOU AGREE THAT USE OF
          THE SITE AND THE CONTENT IS AT YOUR SOLE RISK. ADDITIONALLY, IN NO
          EVENT SHALL THE FOUNDATION AND/OR FOUNDATION PARTIES BE LIABLE FOR ANY
          UNAUTHORIZED ACCESS TO OR USE OF THIRD PARTY MATERIALS, SECURE SERVERS
          AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION
          STORED THEREIN. YOU ACKNOWLEDGE AND AGREE THAT, TO THE FULLEST EXTENT
          PERMITTED BY ANY APPLICABLE LAW, THE DISCLAIMERS CONTAINED HEREIN
          SHALL APPLY TO ANY AND ALL DAMAGES OR INJURIES WHATSOEVER CAUSED BY OR
          RELATED TO THE USE OF, OR INABILITY TO USE, THE SITE OR THE CONTENT,
          UNDER ANY CAUSE OR ACTION WHATSOEVER IN ANY JURISDICTION, INCLUDING,
          WITHOUT LIMITATION, ACTIONS FOR BREACH OF WARRANTY, BREACH OF CONTRACT
          OR TORT (INCLUDING NEGLIGENCE). UNDER NO CIRCUMSTANCES WHATSOEVER WILL
          THE FOUNDATION AND/OR ANY FOUNDATION PARTIES, EVEN IF ADVISED OF THE
          POSSIBILITY OF SUCH DAMAGES, BE RESPONSIBLE OR LIABLE TO YOU OR TO ANY
          OTHER ENTITY FOR ANY COMPENSATORY, INDIRECT, INCIDENTAL, CONSEQUENTIAL
          (INCLUDING FOR LOSS OF PROFITS, LOST BUSINESS OPPORTUNITIES, LOSS OF
          GOODWILL OR DATA DESTRUCTION OR IMPAIRMENT), SPECIAL, EXEMPLARY, OR
          PUNITIVE DAMAGES THAT RESULT FROM OR RELATE IN ANY MANNER WHATSOEVER
          TO YOUR USE OF OR INABILITY TO USE THE SITE OR THE CONTENT. IF YOU ARE
          DISSATISFIED WITH THE CONTENTS, OR WITH THESE TERMS, OR YOU HAVE ANY
          DISPUTE WITH THE FOUNDATION AND/OR ANY FOUNDATION PARTIES, YOUR SOLE
          AND EXCLUSIVE REMEDY IS TO DISCONTINUE USING THE SITE AND THE CONTENT.
          YOU FURTHER SPECIFICALLY ACKNOWLEDGE THAT NEITHER THE FOUNDATION NOR
          ANY FOUNDATION PARTIES ARE LIABLE, AND YOU AGREE NOT TO SEEK TO HOLD
          THE FOUNDATION AND/OR FOUNDATION PARTIES LIABLE, FOR THE CONDUCT OF
          THIRD PARTIES, INCLUDING OTHER USERS OF THE SITE OR THE CONTENT,
          ISSUERS OF TOKEN AND OPERATORS OF EXTERNAL SITES, AND THAT THE RISK
          REGARDING THE FOREGOING RESTS ENTIRELY WITH YOU. Additionally, we
          shall not be deemed to be in breach of these Terms, nor shall we incur
          any liability or bear any responsibility due to a delay or failure in
          performance caused by Force Majeure. “<b>Force Majeure</b>” means any
          circumstances beyond our reasonable control, including but not limited
          to acts of God, fire, flood, war, terrorism, embargo, accident, labor
          disputes, or shortage of material, equipment or transport, any law,
          regulation, or any ruling of court, tribunal or governmental agency.
        </p>

        <h2>11. Indemnification</h2>

        <p>
          You agree to indemnify, defend and hold the Foundation and each
          Foundation Party harmless from any claim (including, but without
          limitation, third party claims) or demand (including attorneys’ fees
          and costs and any fines, fees or penalties imposed by any regulatory
          authority) arising out of or related to (i) your breach of these
          Terms, (ii) your use or access of the Site and/or Content, or (iii)
          your violation of any law, rule, regulation, or the rights of any
          third party.
        </p>

        <h2>12. LIMITATION OF LIABILITY</h2>

        <p>
          WITHOUT LIMITING ANY OTHER TERMS HEREIN, IN NO EVENT UNLESS REQUIRED
          BY APPLICABLE LAW OR AGREED TO IN WRITING WILL THE FOUNDATION, AND/OR
          ANY OF FOUNDATION PARTIES, BE LIABLE TO YOU FOR ANY DAMAGES, INCLUDING
          ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT
          OF OR RELATING TO THE USE OR INABILITY TO USE THE CONTENT, THE SITE
          AND/OR ANY OF THEIR RESPECTIVE SOFTWARE(S) (INCLUDING BUT NOT LIMITED
          TO LOSS OF TOKENS OR DATA, OR DATA BEING RENDERED INACCURATE OR LOSSES
          SUSTAINED BY YOU OR THIRD PARTIES OR A FAILURE OF THE SOFTWARE TO
          OPERATE WITH ANY OTHER SOFTWARE) EVEN IF SUCH HOLDER OR OTHER PARTY
          HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. BECAUSE SOME
          JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY
          FOR CERTAIN TYPES OF DAMAGES, SOME OF THE ABOVE LIMITATIONS MAY NOT
          APPLY TO YOU. IN SUCH JURISDICTIONS, THE FOUNDATION’S AND ALL
          FOUNDATION PARTIES’ COLLECTIVE LIABILITY IS LIMITED AND WARRANTIES ARE
          EXCLUDED TO THE GREATEST EXTENT PERMITTED BY THE CORRESPONDING
          APPLICABLE LAW. ADDITIONALLY, YOU ACKNOWLEDGE THAT NEITHER THE
          FOUNDATION NOR ANY FOUNDATION PARTIES ACTS OR SERVES AS YOUR BROKER,
          INTERMEDIARY, AGENT, OR ADVISOR WITH RESPECT TO ANY ACTION (INCLUDING
          THE REFRAINING FROM ANY ACTION), INCLUDING WITHOUT LIMITATION, ANY
          DEPLOYMENT OR CONVERSION OF TOKENS, YOU MAKE OR PROPOSE TO MAKE USING
          THE SITE OR THE CONTENT AND OWES YOU NO FIDUCIARY DUTY. YOU SHALL ALSO
          NOT ASSERT ANY CLAIMS, ACTIONS OR PROCEEDINGS AGAINST THE FOUNDATION
          OR ANY FOUNDATION PARTY UNLESS EXPRESSLY PERMITTED PURSUANT TO THESE
          TERMS.
        </p>

        <h2>13. Dispute Resolution and Governing Law; WAIVER OF JURY TRIAL</h2>

        <p>
          These Terms are governed by and construed in accordance with the laws
          of the Swiss Confederation. Any dispute, controversy or claim arising
          out of or in relation to these Terms, including their validity,
          invalidity, breach, or termination, shall be resolved by arbitration
          in accordance with the Swiss Rules of International Arbitration of the
          Swiss Arbitration Centre in force on the date on which any notice of
          arbitration is submitted in accordance with these Terms. The number of
          arbitrators shall be one, and shall be selected by the Foundation. The
          seat of the arbitration shall be Zurich. The arbitral proceedings
          shall be conducted in English. Within fifteen (15) days from receipt
          of any notice of arbitration, the respondent shall submit to the
          secretariat an answer to such notice of arbitration together, in
          principle, with any counterclaim or set-off defense. The time-limit
          with respect to the designation of an arbitrator shall be fifteen (15)
          days. If the circumstances so justify, the applicable court or
          arbitrator may extend or shorten the above time-limits. The expedited
          procedure shall apply. Notwithstanding the above, you and the
          Foundation may agree at any time to submit the dispute to mediation in
          accordance with the Swiss Rules of Mediation of the Swiss Arbitration
          Centre. You and the Foundation will each be responsible for your own
          costs, as well as half the costs of the applicable arbitrator or
          mediator, in connection with any such arbitration or mediation so
          initiated.
        </p>

        <p>
          <b>
            BY AGREEING TO THESE TERMS AND NOTWITHSTANDING THE FOREGOING
            PROVISIONS OF THIS SECTION 13 OR ANY OTHER PROVISION CONTAINED
            HEREIN, YOU HEREBY IRREVOCABLY WAIVE ALL RIGHTS TO TRIAL BY JURY IN
            ANY ACTION, PROCEEDING OR COUNTERCLAIM (WHETHER BASED ON CONTRACT,
            TORT OR OTHERWISE) BROUGHT BY YOU OR ON YOUR BEHALF THAT RELATES TO
            OR ARISES UNDER OR IN CONNECTION WITH THESE TERMS OR THE PRIVACY
            POLICY. YOU FURTHER HEREBY WAIVE THE RIGHT TO PARTICIPATE IN ANY
            CLASS ACTION OR OTHER COLLECTIVE ACTION THAT RELATES TO OR ARISES
            UNDER OR IN CONNECTION WITH THESE TERMS OR THE PRIVACY POLICY.
          </b>
        </p>

        <h2>14. Surviving Terms</h2>

        <p>
          <u>Section 1</u> and <u>Section 4</u> through <u>Section 15</u>{' '}
          (including this <u>Section 14</u>) herein shall remain valid and in
          full force and effect notwithstanding any rescission or termination of
          these Terms. Without limiting the generality of the foregoing, any
          rights or obligations of the Foundation or you in connection with any
          breach of these Terms accruing prior to, on or as a result of such
          termination or rescission shall continue to in full force and effect
          notwithstanding such termination or rescission of these Terms.
        </p>

        <h2>15. Miscellaneous</h2>

        <p>
          The controlling language for these terms of use is English; the
          meaning of terms, conditions and representations herein are subject to
          definitions and interpretations in the English language. Any
          translation is provided for your convenience and may not be deemed to
          represent accurately the information in the original English.
        </p>

        <p>
          If any provision of these Terms is determined to be invalid or
          unenforceable, the provision shall be deemed to be severable from the
          remainder of these Terms and will not cause their invalidity or
          unenforceability.
        </p>

        <p>
          YOU AGREE THAT ANY CAUSE OF ACTION ARISING OUT OF OR RELATED TO THE
          CONTENT MUST COMMENCE WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION
          ACCRUES. OTHERWISE, SUCH CAUSE OF ACTION IS PERMANENTLY BARRED.
        </p>

        <p>
          Any failure by the Foundation or any Foundation Party to enforce these
          Terms or to assert any right(s), claim(s) or causes of action against
          you under these Terms shall not be construed as a waiver of the rights
          of the Foundation or of such Foundation Party to assert any such
          right(s), claim(s) or causes of action against you.
        </p>

        <p>
          These Terms, together with the Privacy Policy, contain the entire
          agreement and the understanding among the Parties and supersedes all
          prior agreements, understandings or arrangements (both oral and
          written) in relation to the subject matter hereof.
        </p>

        <p>
          You acknowledge and agree that the Foundation Parties are third-party
          beneficiaries of these Terms and the Privacy Policy and may pursue any
          action or claim against you in connection with your breach hereof.
        </p>
      </div>
    </Page>
  );
};
