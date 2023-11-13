// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

interface IMyToken {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract TokenizedBallot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }
    mapping(address => uint256) public voted;

    IMyToken public targetContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;

    constructor(
        bytes32[] memory _proposalNames,
        address _targetContract,
        uint256 _targetBlockNumber
    ) {
        targetContract = IMyToken(_targetContract);
        //validate
        // Validate if targetBlockNumber is in the past
        require(
            _targetBlockNumber < block.number,
            "TokenizedBallot: targetBlockNumber must be in the past"
        );

        //end
        targetBlockNumber = _targetBlockNumber;
        // TODO: Validate if targetBlockNumber is in the past

        for (uint i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint256 proposal, uint256 amount) external {
        uint256 consumedVotingPower = voted[msg.sender];

        require(
            votingPower(msg.sender, consumedVotingPower) >= amount,
            "TokenizedBallot: trying to vote more than allowed"
        );
        
        proposals[proposal].voteCount += amount;
        voted[msg.sender] = consumedVotingPower + amount;
    }

    function votingPower(address account, uint256 consumedVotingPower) public view returns (uint256) {
        // return targetContract.getPastVotes(account, targetBlockNumber);
        return (targetContract.getPastVotes(account, targetBlockNumber) - consumedVotingPower);
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
